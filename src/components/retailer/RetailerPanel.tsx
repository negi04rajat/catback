import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { ProductEditModal } from '@/components/products/ProductEditModal';

export function RetailerPanel() {
  const { products, updateProduct, categories, clusters } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);

  // Mock retailer ID - in real app would come from auth
  const retailerId = 'R1';
  const myProducts = products.filter((p) => p.retailerId === retailerId);

  const stats = {
    total: myProducts.length,
    available: myProducts.filter((p) => p.available).length,
    outOfStock: myProducts.filter((p) => !p.available).length,
  };

  const toggleAvailability = (productId: string, available: boolean) => {
    updateProduct(productId, { available });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold">Retailer Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage your product listings</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-3xl font-bold text-success">{stats.available}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-3xl font-bold text-destructive">{stats.outOfStock}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="bg-card shadow-card">
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>MOQ</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myProducts.map((product) => {
                const category = categories.find((c) => c.id === product.category);
                const cluster = clusters.find((c) => c.id === product.cluster);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          {cluster && (
                            <p className="text-xs text-muted-foreground">{cluster.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category?.name || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{product.price.toLocaleString()}
                    </TableCell>
                    <TableCell>{product.moq}</TableCell>
                    <TableCell>
                      <Switch
                        checked={product.available}
                        onCheckedChange={(checked) => toggleAvailability(product.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {myProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products yet. Click "Add Product" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductEditModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
