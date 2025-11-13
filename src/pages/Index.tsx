import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, ArrowRight, Users, BarChart3, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TradingChart } from "@/components/TradingChart";
import { StatsCard } from "@/components/StatsCard";

// Mock data for demo charts
const generate2KData = () => {
  const data = [];
  let price = 19500;
  let pnl = 0;
  for (let i = 0; i < 30; i++) {
    price += (Math.random() - 0.45) * 50;
    pnl += (Math.random() - 0.3) * 150;
    data.push({
      time: `${i}h`,
      price: parseFloat(price.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2))
    });
  }
  return data;
};

const generateMESData = () => {
  const data = [];
  let price = 5800;
  let pnl = 0;
  for (let i = 0; i < 30; i++) {
    price += (Math.random() - 0.4) * 20;
    pnl += (Math.random() - 0.25) * 200;
    data.push({
      time: `${i}h`,
      price: parseFloat(price.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2))
    });
  }
  return data;
};

const generateMNQData = () => {
  const data = [];
  let price = 20500;
  let pnl = 0;
  for (let i = 0; i < 30; i++) {
    price += (Math.random() - 0.42) * 30;
    pnl += (Math.random() - 0.28) * 180;
    data.push({
      time: `${i}h`,
      price: parseFloat(price.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2))
    });
  }
  return data;
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">TradeStation Nexus</h1>
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

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Platform Performance
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Real trading results from our community of automated traders
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <StatsCard
                title="Total Users"
                value="2,547"
                icon={Users}
                trend={12.5}
              />
              <StatsCard
                title="Total Trades"
                value="45,892"
                icon={BarChart3}
                trend={8.3}
              />
              <StatsCard
                title="Total Profit"
                value="$1,247,890"
                icon={DollarSign}
                trend={15.7}
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Symbol Performance History
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Track performance across 2K, MES, and MNQ symbols with real-time charts
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <TradingChart symbol="2K" data={generate2KData()} />
              <TradingChart symbol="MES" data={generateMESData()} />
              <TradingChart symbol="MNQ" data={generateMNQData()} />
            </div>
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
