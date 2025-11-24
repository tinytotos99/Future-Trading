import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, ArrowRight, Users, BarChart3, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TradingChart } from "@/components/TradingChart";
import { StatsCard } from "@/components/StatsCard";
import { ImportCSV } from "@/components/ImportCSV";
import { fetchTradeLogs, generateChartData, Symbol } from "@/utils/importTradeLogs";

interface SymbolData {
  chartData: { time: string; price: number; pnl: number }[];
  totalPnl: number;
  totalTrades: number;
  winRate: string;
}

const Index = () => {
  const [dataM2K, setDataM2K] = useState<SymbolData>({ chartData: [], totalPnl: 0, totalTrades: 0, winRate: '0.0' });
  const [dataMES, setDataMES] = useState<SymbolData>({ chartData: [], totalPnl: 0, totalTrades: 0, winRate: '0.0' });
  const [dataMNQ, setDataMNQ] = useState<SymbolData>({ chartData: [], totalPnl: 0, totalTrades: 0, winRate: '0.0' });
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadTradeData();
  }, []);

  const loadSymbolData = async (symbol: Symbol): Promise<SymbolData> => {
    const tradeLogs = await fetchTradeLogs(symbol);
    
    if (tradeLogs.length === 0) {
      return { chartData: [], totalPnl: 0, totalTrades: 0, winRate: '0.0' };
    }
    
    const formattedData = generateChartData(tradeLogs, 50);
    const totalPnl = formattedData.length > 0 ? formattedData[formattedData.length - 1].pnl : 0;
    const totalTrades = formattedData.length;
    const winningTrades = formattedData.filter((_, i, arr) => 
      i > 0 && arr[i].pnl > arr[i - 1].pnl
    ).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0.0';
    
    return { chartData: formattedData, totalPnl, totalTrades, winRate };
  };

  const loadTradeData = async () => {
    setLoading(true);
    try {
      const [m2kData, mesData, mnqData] = await Promise.all([
        loadSymbolData('M2K'),
        loadSymbolData('MES'),
        loadSymbolData('MNQ')
      ]);
      
      setDataM2K(m2kData);
      setDataMES(mesData);
      setDataMNQ(mnqData);
      
      // Always show import section so users can import all symbols independently
      setShowImport(true);
    } catch (error) {
      console.error('Error loading trade data:', error);
      setShowImport(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate combined stats
  const totalPnl = dataM2K.totalPnl + dataMES.totalPnl + dataMNQ.totalPnl;
  const totalTrades = dataM2K.totalTrades + dataMES.totalTrades + dataMNQ.totalTrades;
  const avgWinRate = totalTrades > 0 
    ? (((parseFloat(dataM2K.winRate) * dataM2K.totalTrades) + 
        (parseFloat(dataMES.winRate) * dataMES.totalTrades) + 
        (parseFloat(dataMNQ.winRate) * dataMNQ.totalTrades)) / totalTrades).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
              TradeStation Nexus
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Automate Your Trading with{" "}
              <span className="text-primary">Telegram Signals</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your Telegram bot to TradeStation and execute trades automatically
              on 2K, MES, and MNQ symbols with real-time monitoring.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Start Trading <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {showImport && (
          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4 flex justify-center">
              <ImportCSV onImportSuccess={() => {
                setShowImport(false);
                loadTradeData();
              }} />
            </div>
          </section>
        )}

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Platform Performance
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Real trading results from historical data
            </p>
            
            {loading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading data...
              </div>
            ) : totalTrades > 0 ? (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <StatsCard
                  title="Avg Win Rate"
                  value={avgWinRate}
                  prefix=""
                  suffix="%"
                  icon={Users}
                  trend={parseFloat(avgWinRate) - 50}
                />
                <StatsCard
                  title="Total Trades"
                  value={totalTrades.toString()}
                  icon={BarChart3}
                />
                <StatsCard
                  title="Total P&L"
                  value={totalPnl.toFixed(2)}
                  prefix="$"
                  icon={DollarSign}
                  trend={totalPnl > 0 ? 100 : -100}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Symbol Performance History
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Track performance across M2K, MES, and MNQ symbols with real historical data
            </p>
            
            {loading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading charts...
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {dataM2K.chartData.length > 0 ? (
                  <TradingChart symbol="M2K" data={dataM2K.chartData} />
                ) : (
                  <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                    <p className="text-sm">No M2K data</p>
                    <p className="text-xs mt-2">Import m2k.csv to view chart</p>
                  </div>
                )}
                
                {dataMES.chartData.length > 0 ? (
                  <TradingChart symbol="MES" data={dataMES.chartData} />
                ) : (
                  <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                    <p className="text-sm">No MES data</p>
                    <p className="text-xs mt-2">Import mes.csv to view chart</p>
                  </div>
                )}
                
                {dataMNQ.chartData.length > 0 ? (
                  <TradingChart symbol="MNQ" data={dataMNQ.chartData} />
                ) : (
                  <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                    <p className="text-sm">No MNQ data</p>
                    <p className="text-xs mt-2">Import mnq.csv to view chart</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Execution</h3>
                <p className="text-muted-foreground">
                  Execute long and short positions instantly as signals arrive from your
                  Telegram bot.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Integration</h3>
                <p className="text-muted-foreground">
                  Bank-level security for your TradeStation API credentials and trading
                  data.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground">
                  Track your trading performance with detailed charts and P&L reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TradeStation Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
