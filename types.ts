
export enum EntityType {
  HOME = 'Home',
  SHOP = 'Shop',
  INDUSTRY = 'Industry',
  NGO = 'NGO'
}

export interface UserProfile {
  id: string;
  fullName: string;
  contactNumber: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  entityType: EntityType;
}

export interface MaterialComponent {
  name: string;
  weightKg: number;
}

export interface ScanResult {
  components: MaterialComponent[];
  upcyclingIdeas: string[];
}

export interface BuyerQuote {
  id: string;
  buyerName: string;
  material: string;
  ratePerKg: number;
  location: string;
  contactNumber?: string;
  coords?: { lat: number, lng: number };
}

export interface Transaction {
  id: string;
  material: string;
  weight: number;
  rate: number;
  total: number;
  buyerName: string;
  sellerName: string;
  timestamp: number;
  co2Saved: number;
}
