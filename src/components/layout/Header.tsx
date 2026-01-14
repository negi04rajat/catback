import { Search, User, ShoppingBag, Upload, Shield, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const roleIcons = {
  customer: ShoppingBag,
  retailer: Upload,
  admin: Shield,
};

const roleLabels = {
  customer: 'Customer',
  retailer: 'Retailer',
  admin: 'Admin',
};

export function Header() {
  const { filters, setFilters } = useApp();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentRole = user?.role || 'customer';
  const RoleIcon = roleIcons[currentRole];

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-xl font-bold text-primary-foreground">C</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-serif text-xl font-semibold text-foreground">Catalogue</h1>
            <p className="text-xs text-muted-foreground">Artisan Collection</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, materials, categories..."
              className="pl-10 bg-background border-border focus-visible:ring-primary"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Button variant="outline" disabled>
              <User className="h-4 w-4" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RoleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4" />
                  {roleLabels[currentRole]}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="gap-2" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
