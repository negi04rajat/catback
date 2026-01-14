import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Category, Cluster, UserRole, FilterState } from '@/types/product';
import { products as initialProducts, categories as initialCategories, clusters as initialClusters } from '@/data/mockData';

interface AppContextType {
  products: Product[];
  categories: Category[];
  clusters: Cluster[];
  userRole: UserRole;
  filters: FilterState;
  setUserRole: (role: UserRole) => void;
  setFilters: (filters: FilterState) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addCluster: (cluster: Omit<Cluster, 'id'>) => void;
  deleteCluster: (id: string) => void;
  getFilteredProducts: () => Product[];
}

const defaultFilters: FilterState = {
  category: '',
  cluster: '',
  priceRange: [0, 100000],
  availability: 'all',
  search: '',
  sort: 'newest',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setClusters((prev) => prev.filter((c) => c.categoryId !== id));
  };

  const addCluster = (cluster: Omit<Cluster, 'id'>) => {
    const newCluster: Cluster = {
      ...cluster,
      id: Date.now().toString(),
    };
    setClusters((prev) => [...prev, newCluster]);
  };

  const deleteCluster = (id: string) => {
    setClusters((prev) => prev.filter((c) => c.id !== id));
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.material.toLowerCase().includes(searchLower)
      );
    }

    // Category
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Cluster
    if (filters.cluster) {
      filtered = filtered.filter((p) => p.cluster === filters.cluster);
    }

    // Price Range
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Availability
    if (filters.availability === 'available') {
      filtered = filtered.filter((p) => p.available);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter((p) => !p.available);
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        clusters,
        userRole,
        filters,
        setUserRole,
        setFilters,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        addCluster,
        deleteCluster,
        getFilteredProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
