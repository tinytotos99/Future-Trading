import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportCSV } from '@/components/ImportCSV';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const Logs = () => {
  const navigate = useNavigate();
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

  if (!user) return null;

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header 
        isAuthenticated={true}
        showNavigation={true}
        position="sticky"
        logoLink="/dashboard"
      />

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

