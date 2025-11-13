import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TradingChart } from "@/components/TradingChart";
import { TradeNotification } from "@/components/TradeNotification";
import { StatsCard } from "@/components/StatsCard";
import { TradesTable } from "@/components/TradesTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Activity, DollarSign, TrendingUp, Radio, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock data generators
const generateChartData = (symbol: string) => {
  const basePrice = symbol === "2K" ? 2000 : symbol === "MES" ? 4500 : 15000;
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15}`,
    price: basePrice + (Math.random() - 0.5) * 100,
    pnl: (Math.random() - 0.3) * 500,
  }));
};

const mockNotifications = [
  { id: "1", symbol: "MES", type: "LONG" as const, price: 4523.5, timestamp: "10:45 AM", isNew: true },
  { id: "2", symbol: "2K", type: "SHORT" as const, price: 2001.25, timestamp: "10:30 AM", isNew: false },
  { id: "3", symbol: "MNQ", type: "LONG" as const, price: 15234.75, timestamp: "10:15 AM", isNew: false },
];

const mockTrades = [
  { id: "1", symbol: "MES", type: "LONG" as const, entryPrice: 4520.0, exitPrice: 4525.0, quantity: 5, pnl: 250.0, status: "CLOSED" as const, timestamp: "10:30 AM" },
  { id: "2", symbol: "2K", type: "SHORT" as const, entryPrice: 2005.0, exitPrice: 2001.0, quantity: 3, pnl: 120.0, status: "CLOSED" as const, timestamp: "10:15 AM" },
  { id: "3", symbol: "MNQ", type: "LONG" as const, entryPrice: 15200.0, quantity: 2, status: "OPEN" as const, timestamp: "10:00 AM" },
  { id: "4", symbol: "MES", type: "SHORT" as const, entryPrice: 4530.0, exitPrice: 4535.0, quantity: 4, pnl: -200.0, status: "CLOSED" as const, timestamp: "9:45 AM" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [chartData2K] = useState(generateChartData("2K"));
  const [chartDataMES] = useState(generateChartData("MES"));
  const [chartDataMNQ] = useState(generateChartData("MNQ"));

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Trading Platform</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Radio className="w-4 h-4 text-success animate-pulse" />
              Connected to Telegram & TradeStation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-card border border-border rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Live</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total P&L" value="1,234.50" prefix="$" icon={DollarSign} trend={12.5} />
        <StatsCard title="Win Rate" value="68.5" prefix="" icon={TrendingUp} trend={2.3} />
        <StatsCard title="Active Trades" value="3" icon={Activity} />
        <StatsCard title="Today's Trades" value="12" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Notifications */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Live Signals</h2>
          {mockNotifications.map((notification) => (
            <TradeNotification key={notification.id} {...notification} />
          ))}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TradingChart symbol="2K" data={chartData2K} />
          <TradingChart symbol="MES" data={chartDataMES} />
          <TradingChart symbol="MNQ" data={chartDataMNQ} />
        </div>
      </div>

      {/* Trades Table */}
      <TradesTable trades={mockTrades} />
    </div>
  );
};

export default Dashboard;
