import { useState } from 'react';
import { Product } from '@/types/product';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

interface ProductEditModalProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductEditModal({ product, open, onClose }: ProductEditModalProps) {
  const { categories, clusters, updateProduct, addProduct } = useApp();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    cluster: product?.cluster || '',
    price: product?.price || 0,
    material: product?.material || '',
    size: product?.size || '',
    moq: product?.moq || 1,
    available: product?.available ?? true,
    images: product?.images || [''],
    description: product?.description || '',
    retailerId: product?.retailerId || 'R1',
  });

  const filteredClusters = formData.category
    ? clusters.filter((c) => c.categoryId === formData.category)
    : clusters;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditing && product) {
      updateProduct(product.id, formData);
      toast.success('Product updated successfully');
    } else {
      addProduct(formData);
      toast.success('Product added successfully');
    }
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter product name"
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Region/Cluster</Label>
              <Select
                value={formData.cluster}
                onValueChange={(value) => handleChange('cluster', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {filteredClusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moq">MOQ</Label>
              <Input
                id="moq"
                type="number"
                value={formData.moq}
                onChange={(e) => handleChange('moq', Number(e.target.value))}
                min={1}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value)}
                placeholder="e.g., Cotton, Silk"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                placeholder="e.g., 5.5m, 12 inches"
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <ImageUpload
              value={formData.images}
              onChange={(urls) => handleChange('images', urls)}
              maxImages={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="bg-background"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="available">Availability</Label>
              <p className="text-xs text-muted-foreground">
                {formData.available ? 'Product is available' : 'Product is out of stock'}
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleChange('available', checked)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
