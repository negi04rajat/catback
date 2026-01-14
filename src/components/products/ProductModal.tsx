import { Product } from '@/types/product';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, Ruler, Layers, Calendar } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const { categories, clusters } = useApp();
  const category = categories.find((c) => c.id === product.category);
  const cluster = clusters.find((c) => c.id === product.cluster);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {category && <Badge variant="secondary">{category.name}</Badge>}
              {cluster && <Badge variant="outline">{cluster.name}</Badge>}
              <Badge variant={product.available ? 'default' : 'destructive'}>
                {product.available ? 'Available' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="text-3xl font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Material</p>
                  <p className="text-sm text-muted-foreground">{product.material}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm text-muted-foreground">{product.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Minimum Order Quantity</p>
                  <p className="text-sm text-muted-foreground">{product.moq} units</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
