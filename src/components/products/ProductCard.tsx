import { Product } from '@/types/product';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { useState } from 'react';
import { ProductModal } from './ProductModal';
import { ProductEditModal } from './ProductEditModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { userRole, deleteProduct, categories, clusters } = useApp();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const category = categories.find((c) => c.id === product.category);
  const cluster = clusters.find((c) => c.id === product.cluster);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(product.id);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden bg-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-1">
                Out of Stock
              </Badge>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-serif font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {cluster && (
              <p className="text-xs text-muted-foreground mt-1">{cluster.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              MOQ: {product.moq}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">Material:</span> {product.material}</p>
            <p><span className="font-medium">Size:</span> {product.size}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowViewModal(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {(userRole === 'retailer' || userRole === 'admin') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {userRole === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ProductModal
        product={product}
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
      />

      {(userRole === 'retailer' || userRole === 'admin') && (
        <ProductEditModal
          product={product}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
