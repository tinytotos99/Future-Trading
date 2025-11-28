import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Users,
  BarChart3,
  DollarSign,
  Mail,
  Send,
  MessageCircle,
  MessageSquare,
  Github,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TradingChart } from '@/components/TradingChart';
import { StatsCard } from '@/components/StatsCard';
import { fetchTradeLogs, fetchAllTradeLogs, generateChartData, Symbol } from '@/utils/importTradeLogs';
import { supabase } from '@/integrations/supabase/client';

interface SymbolData {
  chartData: { time: string; balance: number; change: number; pnl: number }[];
  totalPnl: number;
  totalTrades: number;
  winRate: string;
  totalPnlPercent: string;
  startedDate: string;
}

const Index = () => {
  const [dataM2K, setDataM2K] = useState<SymbolData>({
    chartData: [],
    totalPnl: 0,
    totalTrades: 0,
    winRate: '0.0',
    totalPnlPercent: '0.0',
    startedDate: '',
  });
  const [dataMES, setDataMES] = useState<SymbolData>({
    chartData: [],
    totalPnl: 0,
    totalTrades: 0,
    winRate: '0.0',
    totalPnlPercent: '0.0',
    startedDate: '',
  });
  const [dataMNQ, setDataMNQ] = useState<SymbolData>({
    chartData: [],
    totalPnl: 0,
    totalTrades: 0,
    winRate: '0.0',
    totalPnlPercent: '0.0',
    startedDate: '',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTradeData();
  }, []);

  const loadSymbolData = async (symbol: Symbol): Promise<SymbolData> => {
    // Fetch last 3 months of data for chart
    const tradeLogs = await fetchTradeLogs(symbol, undefined, 3);

    // Fetch all historical data for overall stats
    const allTradeLogs = await fetchAllTradeLogs(symbol);

    if (tradeLogs.length === 0) {
      return {
        chartData: [],
        totalPnl: 0,
        totalTrades: 0,
        winRate: '0.0',
        totalPnlPercent: '0.0',
        startedDate: '',
      };
    }

    const formattedData = generateChartData(tradeLogs, 50);

    // Calculate stats for the 3-month period (for chart)
    const chartPnl = formattedData.length > 0 ? formattedData[formattedData.length - 1].cumulativePnl : 0;

    // Calculate overall stats from all historical data
    const totalTrades = allTradeLogs.length;
    const winningTrades = allTradeLogs.filter((log: any) => log.pnl > 0).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0.0';

    // Calculate total PNL from all trades
    const totalPnl = allTradeLogs.reduce((sum: number, log: any) => sum + (log.pnl || 0), 0);

    // Calculate total PNL percentage (based on initial $1000)
    const INITIAL_BALANCE = 1000;
    const totalPnlPercent = ((totalPnl / INITIAL_BALANCE) * 100).toFixed(2);

    // Get started date (first trade date)
    const startedDate = allTradeLogs.length > 0 ? (allTradeLogs[0] as any).trade_date : '';

    return {
      chartData: formattedData,
      totalPnl,
      totalTrades,
      winRate,
      totalPnlPercent,
      startedDate,
    };
  };

  const loadTradeData = async () => {
    setLoading(true);
    try {
      const [m2kData, mesData, mnqData] = await Promise.all([loadSymbolData('M2K'), loadSymbolData('MES'), loadSymbolData('MNQ')]);

      setDataM2K(m2kData);
      setDataMES(mesData);
      setDataMNQ(mnqData);
    } catch (error) {
      console.error('Error loading trade data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate combined stats
  const totalPnl = dataM2K.totalPnl + dataMES.totalPnl + dataMNQ.totalPnl;
  const totalTrades = dataM2K.totalTrades + dataMES.totalTrades + dataMNQ.totalTrades;
  const avgWinRate =
    totalTrades > 0
      ? (
          (parseFloat(dataM2K.winRate) * dataM2K.totalTrades +
            parseFloat(dataMES.winRate) * dataMES.totalTrades +
            parseFloat(dataMNQ.winRate) * dataMNQ.totalTrades) /
          totalTrades
        ).toFixed(1)
      : '0.0';

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert contact message into database
      const { error: dbError } = await supabase.from('contact_messages' as any).insert([
        {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
        },
      ] as any);

      if (dbError) throw dbError;

      // Send email notification via edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase URL or key not found, skipping email notification');
      } else {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
            body: {
              name: contactForm.name,
              email: contactForm.email,
              message: contactForm.message,
            },
          });

          if (emailError) {
            console.error('Error sending email notification:', emailError);
            // Don't throw - email failure shouldn't prevent form submission success
          }
        } catch (emailErr) {
          console.error('Error calling email function:', emailErr);
          // Don't throw - email failure shouldn't prevent form submission success
        }
      }

      toast({
        title: 'Message sent!',
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      // Reset form
      setContactForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col relative'>
      <header className='border-b absolute z-50 w-full '>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <Link to='/'>
            <h1 className='text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity'>TradeStation Nexus</h1>
          </Link>
          <div className='flex items-center gap-4'>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <section className='relative overflow-hidden min-h-screen flex items-center justify-center'>
          {/* Animated Background Elements */}
          <div className='absolute inset-0 -z-10'>
            {/* Animated Gradient Background */}
            <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 animate-gradient-shift'></div>

            {/* Grid Pattern Overlay */}
            <div className='absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-20'></div>

            {/* Animated Orbs */}
            <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float-slow'></div>
            <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float-reverse'></div>
            <div className='absolute top-1/2 right-1/3 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float'></div>

            {/* Animated Lines */}
            <div className='absolute top-0 left-0 w-full h-full'>
              <div className='absolute top-1/4 left-0 w-px h-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-pulse'></div>
              <div className='absolute top-0 right-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse delay-1000'></div>
            </div>
          </div>

          {/* Content */}
          <div className='container mx-auto px-4 text-center relative z-10'>
            <h2 className='text-4xl md:text-6xl font-bold mb-6'>
              Automate Your Trading with <span className='text-primary'>Telegram Signals</span>
            </h2>
            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Connect your Telegram bot to TradeStation and execute trades automatically on M2K, MES, and MNQ symbols with real-time
              monitoring.
            </p>
            <div className='flex gap-4 justify-center'>
              <Button size='lg' variant='outline' className='relative overflow-hidden group'>
                <span className='relative z-10'>Learn More</span>
                <div className='absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500'></div>
              </Button>
            </div>
          </div>
        </section>

        <section className='py-20'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>Platform Performance</h2>
            <p className='text-center text-muted-foreground mb-12 max-w-2xl mx-auto'>Real trading results from historical data</p>

            {loading ? (
              <div className='text-center text-muted-foreground py-12'>Loading data...</div>
            ) : totalTrades > 0 ? (
              <div className='grid md:grid-cols-3 gap-6 mb-12'>
                <StatsCard title='Avg Win Rate' value={avgWinRate} prefix='' suffix='%' icon={Users} trend={parseFloat(avgWinRate) - 50} />
                <StatsCard title='Total Trades' value={totalTrades.toString()} icon={BarChart3} />
                <StatsCard title='Total P&L' value={totalPnl.toFixed(2)} prefix='$' icon={DollarSign} trend={totalPnl > 0 ? 100 : -100} />
              </div>
            ) : null}
          </div>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>Symbol Performance History</h2>
            <p className='text-center text-muted-foreground mb-12 max-w-2xl mx-auto'>
              Track performance across M2K, MES, and MNQ symbols - Last 3 Months
            </p>

            {loading ? (
              <div className='text-center text-muted-foreground py-12'>Loading charts...</div>
            ) : (
              <div className='grid md:grid-cols-3 gap-6'>
                {dataM2K.chartData.length > 0 ? (
                  <TradingChart
                    symbol='M2K'
                    data={dataM2K.chartData}
                    winRate={dataM2K.winRate}
                    totalPnlPercent={dataM2K.totalPnlPercent}
                    totalTrades={dataM2K.totalTrades}
                    startedDate={dataM2K.startedDate}
                  />
                ) : (
                  <div className='text-center text-muted-foreground py-12 border border-dashed rounded-lg'>
                    <p className='text-sm'>No M2K data</p>
                    <p className='text-xs mt-2'>Import m2k.csv to view chart</p>
                  </div>
                )}

                {dataMES.chartData.length > 0 ? (
                  <TradingChart
                    symbol='MES'
                    data={dataMES.chartData}
                    winRate={dataMES.winRate}
                    totalPnlPercent={dataMES.totalPnlPercent}
                    totalTrades={dataMES.totalTrades}
                    startedDate={dataMES.startedDate}
                  />
                ) : (
                  <div className='text-center text-muted-foreground py-12 border border-dashed rounded-lg'>
                    <p className='text-sm'>No MES data</p>
                    <p className='text-xs mt-2'>Import mes.csv to view chart</p>
                  </div>
                )}

                {dataMNQ.chartData.length > 0 ? (
                  <TradingChart
                    symbol='MNQ'
                    data={dataMNQ.chartData}
                    winRate={dataMNQ.winRate}
                    totalPnlPercent={dataMNQ.totalPnlPercent}
                    totalTrades={dataMNQ.totalTrades}
                    startedDate={dataMNQ.startedDate}
                  />
                ) : (
                  <div className='text-center text-muted-foreground py-12 border border-dashed rounded-lg'>
                    <p className='text-sm'>No MNQ data</p>
                    <p className='text-xs mt-2'>Import mnq.csv to view chart</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className='py-20'>
          <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='bg-card p-6 rounded-lg border'>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <TrendingUp className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Real-Time Execution</h3>
                <p className='text-muted-foreground'>
                  Execute long and short positions instantly as signals arrive from your Telegram bot.
                </p>
              </div>

              <div className='bg-card p-6 rounded-lg border'>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Shield className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Secure Integration</h3>
                <p className='text-muted-foreground'>Bank-level security for your TradeStation API credentials and trading data.</p>
              </div>

              <div className='bg-card p-6 rounded-lg border'>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Zap className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Performance Analytics</h3>
                <p className='text-muted-foreground'>Track your trading performance with detailed charts and P&L reports.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Get in Touch Section */}
        <section className='py-20'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold mb-4'>Get in Touch</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Have questions or want to learn more? Reach out to us and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-8'>
                {/* Contact Form */}
                <div className='bg-card p-6 rounded-lg border'>
                  <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                    <Mail className='h-5 w-5 text-primary' />
                    Send us a message
                  </h3>
                  <form onSubmit={handleContactSubmit} className='space-y-4'>
                    <div>
                      <label htmlFor='name' className='text-sm font-medium mb-2 block'>
                        Name
                      </label>
                      <Input
                        id='name'
                        type='text'
                        placeholder='Your name'
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor='email' className='text-sm font-medium mb-2 block'>
                        Email
                      </label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='your.email@example.com'
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor='message' className='text-sm font-medium mb-2 block'>
                        Message
                      </label>
                      <Textarea
                        id='message'
                        placeholder='Your message...'
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        rows={5}
                      />
                    </div>
                    <Button type='submit' className='w-full' disabled={isSubmitting}>
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className='mr-2 h-4 w-4' />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Social Links */}
                <div className='bg-card p-6 rounded-lg border'>
                  <h3 className='text-xl font-semibold mb-4'>Connect with us</h3>
                  <p className='text-muted-foreground mb-6'>Follow us on social media to stay updated with the latest news and updates.</p>

                  <div className='space-y-4'>
                    <a
                      href='https://t.me'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group'
                    >
                      <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                        <MessageCircle className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Telegram</p>
                        <p className='text-sm text-muted-foreground'>@tradestationnexus</p>
                      </div>
                    </a>

                    <a
                      href='mailto:tinytotos99@gmail.com'
                      className='flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group'
                    >
                      <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                        <Mail className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Email</p>
                        <p className='text-sm text-muted-foreground'>tinytotos99@gmail.com</p>
                      </div>
                    </a>

                    <a
                      href='https://discord.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group'
                    >
                      <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Discord</p>
                        <p className='text-sm text-muted-foreground'>TradeStation Nexus</p>
                      </div>
                    </a>

                    <a
                      href='https://github.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group'
                    >
                      <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                        <Github className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>GitHub</p>
                        <p className='text-sm text-muted-foreground'>@tradestationnexus</p>
                      </div>
                    </a>
                  </div>

                  <div className='mt-6 pt-6 border-t'>
                    <p className='text-sm text-muted-foreground mb-2'>Email us directly</p>
                    <a href='mailto:tinytotos99@gmail.com' className='text-primary hover:underline font-medium'>
                      tinytotos99@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t py-8'>
        <div className='container mx-auto px-4 text-center text-muted-foreground'>
          <p>&copy; 2025 TradeStation Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
