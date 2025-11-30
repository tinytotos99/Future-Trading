import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  isAuthenticated?: boolean;
  showNavigation?: boolean;
  showLiveIndicator?: boolean;
  position?: 'absolute' | 'sticky' | 'static';
  logoLink?: string;
}

export const Header = ({
  isAuthenticated = false,
  showNavigation = false,
  showLiveIndicator = false,
  position = 'static',
  logoLink = '/',
}: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/');
  };

  const positionClasses = {
    absolute: 'absolute z-50 w-full',
    sticky: 'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    static: '',
  };

  return (
    <header className={`border-b ${positionClasses[position]}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={logoLink} className="flex items-center gap-2">
          <img src="/favicon.ico" alt="TradeStation Nexus Logo" className="h-6 w-6 rounded-full" />
          <h1 className="text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
            TradeStation Nexus
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          {showNavigation && isAuthenticated && (
            <nav className="flex items-center gap-2">
              <Button
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === '/logs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/logs')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Logs
              </Button>
            </nav>
          )}
          {showLiveIndicator && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-card border border-border rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Live</span>
            </div>
          )}
          <ThemeToggle />
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

