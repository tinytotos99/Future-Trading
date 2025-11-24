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
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
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
    'M2K': 'trade_logs_m2k',
    'MES': 'trade_logs_mes',
    'MNQ': 'trade_logs_mnq'
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
    
    // Prepare data for insertion
    const tradeLogs = parsedData
      .filter(row => row.Date && row.PNL && row.Price)
      .map(row => ({
        trade_date: parseTradeDate(row.Date),
        pnl: parseFloat(row.PNL) || 0,
        order_size: parseFloat(row['Order size']) || 1,
        price: parseFloat(row.Price) || 0,
      }));
    
    // Insert in batches (Supabase has a limit)
    const batchSize = 1000;
    for (let i = 0; i < tradeLogs.length; i += batchSize) {
      const batch = tradeLogs.slice(i, i + batchSize);
      const { error } = await supabase
        .from(tableName as any)
        .insert(batch as any);
      
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

export const fetchTradeLogs = async (symbol: Symbol, limit?: number) => {
  const tableName = getTableName(symbol);
  
  const query = supabase
    .from(tableName as any)
    .select('*')
    .order('trade_date', { ascending: true });
  
  if (limit) {
    query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching trade logs for ${symbol}:`, error);
    return [];
  }
  console.log("trade logs length:", symbol, data.length)
  
  return data || [];
};

// Format date for display (YYYY-MM-DD to readable format)
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}/${date.getFullYear().toString().slice(-2)}`;
};

// Generate aggregated data for charts (sample every N records)
export const generateChartData = (tradeLogs: any[], sampleSize = 30) => {
  if (tradeLogs.length === 0) return [];
  
  const step = Math.max(1, Math.floor(tradeLogs.length / sampleSize));
  const sampledData = [];
  
  let cumulativePnl = 0;
  
  for (let i = 0; i < tradeLogs.length; i += step) {
    const log = tradeLogs[i];
    cumulativePnl += log.pnl;
    
    sampledData.push({
      time: formatDateForDisplay(log.trade_date),
      price: log.price,
      pnl: parseFloat(cumulativePnl.toFixed(2)),
    });
  }
  
  // Always include the last record
  if (tradeLogs.length > 0 && sampledData[sampledData.length - 1]?.time !== formatDateForDisplay(tradeLogs[tradeLogs.length - 1].trade_date)) {
    const lastLog = tradeLogs[tradeLogs.length - 1];
    cumulativePnl = tradeLogs.reduce((sum, log) => sum + log.pnl, 0);
    sampledData.push({
      time: formatDateForDisplay(lastLog.trade_date),
      price: lastLog.price,
      pnl: parseFloat(cumulativePnl.toFixed(2)),
    });
  }
  
  return sampledData;
};

