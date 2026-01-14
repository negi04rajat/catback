import { useApp } from '@/contexts/AppContext';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

export function ProductGrid() {
  const { getFilteredProducts } = useApp();
  const products = getFilteredProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
