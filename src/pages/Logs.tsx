import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportCSV } from '@/components/ImportCSV';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';

const Logs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  if (!user) return null;

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header with Navigation */}
      <header className='border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <Link to='/dashboard'>
            <h1 className='text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity'>
              TradeStation Nexus
            </h1>
          </Link>
          <div className='flex items-center gap-4'>
            <nav className='flex items-center gap-2'>
              <Button
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => navigate('/dashboard')}
                className='flex items-center gap-2'
              >
                <LayoutDashboard className='h-4 w-4' />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === '/logs' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => navigate('/logs')}
                className='flex items-center gap-2'
              >
                <FileText className='h-4 w-4' />
                Logs
              </Button>
            </nav>
            <ThemeToggle />
            <Button variant='ghost' size='icon' onClick={handleSignOut}>
              <LogOut className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-2'>Import Trade Logs</h2>
            <p className='text-muted-foreground'>
              Import historical trade data from CSV files for M2K, MES, and MNQ symbols
            </p>
          </div>
          <ImportCSV />
        </div>
      </main>
    </div>
  );
};

export default Logs;

