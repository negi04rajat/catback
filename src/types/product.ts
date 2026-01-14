export interface Product {
  id: string;
  name: string;
  category: string;
  cluster: string;
  price: number;
  material: string;
  size: string;
  moq: number;
  available: boolean;
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  retailerId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Cluster {
  id: string;
  name: string;
  categoryId: string;
  description: string;
}

export type UserRole = 'customer' | 'retailer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

export interface FilterState {
  category: string;
  cluster: string;
  priceRange: [number, number];
  availability: 'all' | 'available' | 'unavailable';
  search: string;
  sort: SortOption;
}
