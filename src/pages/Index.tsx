import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { FilterSidebar } from '@/components/layout/FilterSidebar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { RetailerPanel } from '@/components/retailer/RetailerPanel';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const { user, loading } = useAuth();
  const { getFilteredProducts } = useApp();
  const products = getFilteredProducts();

  const userRole = user?.role || 'customer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 lg:py-8">
        {userRole === 'admin' ? (
          <AdminPanel />
        ) : userRole === 'retailer' ? (
          <RetailerPanel />
        ) : (
          <>
            {/* Hero Section */}
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                Artisan Catalogue
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover authentic handcrafted products from skilled artisans. 
                Browse our curated collection of traditional textiles, home decor, jewelry, and more.
              </p>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
              <FilterSidebar />
              <div className="flex-1">
                <ProductGrid />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Artisan Catalogue. Celebrating traditional craftsmanship.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
