// Dummy data for the admin dashboard

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  featured: boolean;
  description: string;
  category: string;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  country: string;
  joinedDate: string;
}

export interface Sale {
  id: string;
  customerName: string;
  quantity: number;
  address: string;
  totalPrice: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  alt: string;
}

export interface Settings {
  minPurchaseAmount: number;
  overallDiscount: number;
}

// Products dummy data
export const productsData: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    featured: true,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    stock: 25
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    featured: true,
    description: 'Advanced smartwatch with health monitoring',
    category: 'Electronics',
    stock: 15
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    featured: false,
    description: 'Comfortable office chair with lumbar support',
    category: 'Furniture',
    stock: 8
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop',
    featured: true,
    description: 'RGB mechanical keyboard for gaming and productivity',
    category: 'Electronics',
    stock: 30
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
    featured: false,
    description: 'Modern LED desk lamp with adjustable brightness',
    category: 'Home',
    stock: 20
  }
];

// Users dummy data
export const usersData: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'New York',
    pincode: '10001',
    country: 'USA',
    joinedDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    pincode: '90210',
    country: 'USA',
    joinedDate: '2023-03-22'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+44 20 7946 0958',
    address: '789 King Street',
    city: 'London',
    pincode: 'SW1A 1AA',
    country: 'UK',
    joinedDate: '2023-02-10'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '+1 (555) 246-8135',
    address: '321 Pine Street',
    city: 'Chicago',
    pincode: '60601',
    country: 'USA',
    joinedDate: '2023-04-05'
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david.lee@email.com',
    phone: '+61 2 9374 4000',
    address: '654 George Street',
    city: 'Sydney',
    pincode: '2000',
    country: 'Australia',
    joinedDate: '2023-01-30'
  }
];

// Sales dummy data
export const salesData: Sale[] = [
  {
    id: '1',
    customerName: 'John Smith',
    quantity: 2,
    address: '123 Main Street, New York, NY 10001',
    totalPrice: 599.98,
    date: '2024-01-20',
    status: 'completed'
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    quantity: 1,
    address: '456 Oak Avenue, Los Angeles, CA 90210',
    totalPrice: 399.99,
    date: '2024-01-19',
    status: 'pending'
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    quantity: 3,
    address: '789 King Street, London, SW1A 1AA, UK',
    totalPrice: 389.97,
    date: '2024-01-18',
    status: 'completed'
  },
  {
    id: '4',
    customerName: 'Emma Wilson',
    quantity: 1,
    address: '321 Pine Street, Chicago, IL 60601',
    totalPrice: 449.99,
    date: '2024-01-17',
    status: 'completed'
  },
  {
    id: '5',
    customerName: 'David Lee',
    quantity: 2,
    address: '654 George Street, Sydney, NSW 2000, Australia',
    totalPrice: 219.98,
    date: '2024-01-16',
    status: 'cancelled'
  }
];

// Banners dummy data
export const bannersData: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    title: 'Winter Sale Banner',
    alt: 'Winter sale promotion banner'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop',
    title: 'Tech Products Banner',
    alt: 'Technology products showcase banner'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    title: 'Home Decor Banner',
    alt: 'Home decoration collection banner'
  }
];

// Settings dummy data
export const settingsData: Settings = {
  minPurchaseAmount: 50,
  overallDiscount: 15
};