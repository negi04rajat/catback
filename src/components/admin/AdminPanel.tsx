import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, FolderTree, Layers } from 'lucide-react';
import { toast } from 'sonner';

export function AdminPanel() {
  const { categories, clusters, addCategory, deleteCategory, addCluster, deleteCluster } = useApp();
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newCluster, setNewCluster] = useState({ name: '', categoryId: '', description: '' });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) {
      toast.error('Category name is required');
      return;
    }
    addCategory(newCategory);
    setNewCategory({ name: '', description: '' });
    toast.success('Category added successfully');
  };

  const handleDeleteCategory = (id: string) => {
    const categoryProducts = clusters.filter(c => c.categoryId === id);
    if (categoryProducts.length > 0) {
      if (!confirm('This will also delete all clusters in this category. Continue?')) {
        return;
      }
    }
    deleteCategory(id);
    toast.success('Category deleted');
  };

  const handleAddCluster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCluster.name || !newCluster.categoryId) {
      toast.error('Cluster name and category are required');
      return;
    }
    addCluster(newCluster);
    setNewCluster({ name: '', categoryId: '', description: '' });
    toast.success('Cluster added successfully');
  };

  const handleDeleteCluster = (id: string) => {
    deleteCluster(id);
    toast.success('Cluster deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
          <FolderTree className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage categories and clusters</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories Management */}
        <Card className="bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCategory} className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="catName">Category Name</Label>
                <Input
                  id="catName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Traditional Textiles"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catDesc">Description</Label>
                <Textarea
                  id="catDesc"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description"
                  rows={2}
                  className="bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Clusters</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {clusters.filter((c) => c.categoryId === cat.id).length}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Clusters Management */}
        <Card className="bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Clusters (Product Types)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCluster} className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="clusterName">Cluster Name</Label>
                <Input
                  id="clusterName"
                  value={newCluster.name}
                  onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                  placeholder="e.g., Chanderi Sarees"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={newCluster.categoryId}
                  onValueChange={(value) => setNewCluster({ ...newCluster, categoryId: value })}
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
                <Label htmlFor="clusterDesc">Description</Label>
                <Textarea
                  id="clusterDesc"
                  value={newCluster.description}
                  onChange={(e) => setNewCluster({ ...newCluster, description: e.target.value })}
                  placeholder="Brief description"
                  rows={2}
                  className="bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Cluster
              </Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((cluster) => {
                  const category = categories.find((c) => c.id === cluster.categoryId);
                  return (
                    <TableRow key={cluster.id}>
                      <TableCell className="font-medium">{cluster.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCluster(cluster.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
