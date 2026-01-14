import { useApp } from '@/contexts/AppContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function FilterSidebar() {
  const { categories, clusters, filters, setFilters } = useApp();

  const filteredClusters = filters.category
    ? clusters.filter((c) => c.categoryId === filters.category)
    : clusters;

  const resetFilters = () => {
    setFilters({
      category: '',
      cluster: '',
      priceRange: [0, 100000],
      availability: 'all',
      search: filters.search,
      sort: 'newest',
    });
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 p-4 lg:p-6 bg-card rounded-lg shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters({ ...filters, sort: value as any })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value, cluster: '' })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cluster */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Product Type</Label>
        <Select
          value={filters.cluster}
          onValueChange={(value) => setFilters({ ...filters, cluster: value })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="">All Types</SelectItem>
            {filteredClusters.map((cluster) => (
              <SelectItem key={cluster.id} value={cluster.id}>
                {cluster.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Price Range: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
        </Label>
        <Slider
          min={0}
          max={100000}
          step={500}
          value={filters.priceRange}
          onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
          className="py-2"
        />
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Availability</Label>
        <RadioGroup
          value={filters.availability}
          onValueChange={(value) => setFilters({ ...filters, availability: value as any })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm font-normal cursor-pointer">All Products</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="available" id="available" />
            <Label htmlFor="available" className="text-sm font-normal cursor-pointer">Available Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unavailable" id="unavailable" />
            <Label htmlFor="unavailable" className="text-sm font-normal cursor-pointer">Out of Stock</Label>
          </div>
        </RadioGroup>
      </div>
    </aside>
  );
}
