import { supabase } from '@/integrations/supabase/client';

export interface TradeLogCSV {
  Date: string;
  PNL: string;
  'Order size': string;
  Price: string;
}

// Parse date from format "24-Jan-22" to "YYYY-MM-DD"
export const parseTradeDate = (dateStr: string): string => {
  const monthMap: { [key: string]: string } = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  // Parse format: "24-Jan-22"
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const day = parts[0].padStart(2, '0');
  const month = monthMap[parts[1]] || '01';
  const yearShort = parts[2];

  // Convert 2-digit year to 4-digit (assuming 20xx for years 00-99)
  const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;

  return `${year}-${month}-${day}`;
};

export const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
};

export const parseCSVContent = (csvContent: string): TradeLogCSV[] => {
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  const data: TradeLogCSV[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length >= 4 && values[0]) {
      data.push({
        Date: values[0],
        PNL: values[1],
        'Order size': values[2],
        Price: values[3],
      });
    }
  }

  return data;
};

export type Symbol = 'M2K' | 'MES' | 'MNQ';

const getTableName = (symbol: Symbol): string => {
  const tableMap = {
    M2K: 'trade_logs_m2k',
    MES: 'trade_logs_mes',
    MNQ: 'trade_logs_mnq',
  };
  return tableMap[symbol];
};

export const importTradeLogs = async (csvContent: string, symbol: Symbol) => {
  try {
    const parsedData = parseCSVContent(csvContent);
    const tableName = getTableName(symbol);

    // First, clear existing data for this symbol
    const { error: deleteError } = await supabase
      .from(tableName as any)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error(`Error clearing existing data for ${symbol}:`, deleteError);
    }

    // Prepare data for insertion with balance calculation
    const INITIAL_BALANCE = 1000;
    let cumulativePnl = 0;

    const tradeLogs = parsedData
      .filter((row) => row.Date && row.PNL && row.Price)
      .map((row, index) => {
        // Calculate balance: initial amount ($1000) + sum of PNL from items 0 to i-1
        // For the first item (index 0), balance = 1000 (no previous PNL)
        // For item at index i, balance = 1000 + sum(PNL[0] to PNL[i-1])
        const balance = INITIAL_BALANCE + cumulativePnl;

        const pnl = parseFloat(row.PNL) || 0;

        // Add current PNL to cumulative for next iteration
        cumulativePnl += pnl;

        return {
          trade_date: parseTradeDate(row.Date),
          pnl: pnl,
          order_size: parseFloat(row['Order size']) || 1,
          price: parseFloat(row.Price) || 0,
          balance: parseFloat(balance.toFixed(2)),
        };
      });

    // Insert in batches (Supabase has a limit)
    const batchSize = 1000;
    for (let i = 0; i < tradeLogs.length; i += batchSize) {
      const batch = tradeLogs.slice(i, i + batchSize);
      const { error } = await supabase.from(tableName as any).insert(batch as any);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1} for ${symbol}:`, error);
        throw error;
      }

      console.log(`[${symbol}] Inserted batch ${i / batchSize + 1} of ${Math.ceil(tradeLogs.length / batchSize)}`);
    }

    return { success: true, count: tradeLogs.length };
  } catch (error) {
    console.error(`Error importing trade logs for ${symbol}:`, error);
    return { success: false, error };
  }
};

// Fetch all historical data (no date filter) - uses pagination to get all rows
export const fetchAllTradeLogs = async (symbol: Symbol) => {
  const tableName = getTableName(symbol);
  const allData: any[] = [];
  const pageSize = 1000; // Supabase default limit
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .order('trade_date', { ascending: true })
      .range(from, from + pageSize - 1);

    console.log(`[${symbol}] Fetched batch ${from / pageSize + 1} of ${Math.ceil(data.length / pageSize)}`);

    if (error) {
      console.error(`Error fetching all trade logs for ${symbol}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      from += pageSize;
      
      // If we got less than pageSize, we've reached the end
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`[${symbol}] Fetched all ${allData.length} trade logs`);
  return allData;
};

export const fetchTradeLogs = async (symbol: Symbol, limit?: number, monthsBack?: number) => {
  const tableName = getTableName(symbol);
  const months = monthsBack || 3;

  // First, get the latest trade date for this symbol
  const { data: latestTrade, error: latestError } = await supabase
    .from(tableName as any)
    .select('trade_date')
    .order('trade_date', { ascending: false })
    .limit(1)
    .single();

  if (latestError || !latestTrade) {
    console.error(`Error fetching latest trade date for ${symbol}:`, latestError);
    return [];
  }

  // Calculate date for last N months from the latest trade date
  const latestTradeData = latestTrade as { trade_date: string };
  const lastTradeDate = new Date(latestTradeData.trade_date);
  const startDateObj = new Date(lastTradeDate);
  startDateObj.setMonth(lastTradeDate.getMonth() - months);

  // Format as YYYY-MM-DD for SQL query
  const startDate = startDateObj.toISOString().split('T')[0];

  // Now fetch trades from the calculated start date
  const query = supabase
    .from(tableName as any)
    .select('*')
    .gte('trade_date', startDate)
    .order('trade_date', { ascending: true });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching trade logs for ${symbol}:`, error);
    return [];
  }
  console.log(`[${symbol}] Trade logs (last ${months} months from ${latestTradeData.trade_date}):`, data.length);

  return data || [];
};

// Format date for display (YYYY-MM-DD to readable format)
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}/${date.getFullYear().toString().slice(-2)}`;
};

// Generate aggregated data for charts showing portfolio performance (balance over time)
// For last 3 months view, we use the actual balance from database
export const generateChartData = (tradeLogs: any[], sampleSize = 30) => {
  if (tradeLogs.length === 0) return [];

  // Get the starting balance (first trade's balance before its PNL is applied)
  // The balance field in DB is the balance BEFORE processing that trade
  // So for the first trade, balance is the starting balance
  const startingBalance = tradeLogs.length > 0 && tradeLogs[0].balance !== undefined ? tradeLogs[0].balance : 1000;

  const step = Math.max(1, Math.floor(tradeLogs.length / sampleSize));
  const sampledData = [];

  let cumulativePnl = 0;

  for (let i = 0; i < tradeLogs.length; i += step) {
    const log = tradeLogs[i];

    // Use balance from database (which is balance before this trade)
    // Then add the current trade's PNL to get the balance after this trade
    const balance = log.balance + log.pnl;
    // Calculate change from starting balance (for better chart visibility)
    const change = balance - startingBalance;
    cumulativePnl = parseFloat(change.toFixed(2));

    sampledData.push({
      time: formatDateForDisplay(log.trade_date),
      balance: parseFloat(balance.toFixed(2)),
      change: parseFloat(change.toFixed(2)), // Change from starting balance
      pnl: parseFloat(log.pnl.toFixed(2)),
      cumulativePnl: parseFloat(cumulativePnl.toFixed(2)),
    });
  }

  // Always include the last record
  if (
    tradeLogs.length > 0 &&
    sampledData[sampledData.length - 1]?.time !== formatDateForDisplay(tradeLogs[tradeLogs.length - 1].trade_date)
  ) {
    const lastLog = tradeLogs[tradeLogs.length - 1];
    cumulativePnl = tradeLogs.reduce((sum, log) => sum + log.pnl, 0);

    const lastBalance = lastLog.balance + lastLog.pnl;
    const lastChange = lastBalance - startingBalance;

    sampledData.push({
      time: formatDateForDisplay(lastLog.trade_date),
      balance: parseFloat(lastBalance.toFixed(2)),
      change: parseFloat(lastChange.toFixed(2)), // Change from starting balance
      pnl: parseFloat(lastLog.pnl.toFixed(2)),
      cumulativePnl: parseFloat(cumulativePnl.toFixed(2)),
    });
  }

  return sampledData;
};
