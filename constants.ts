
import { EntityType } from './types';

export const CO2_FACTORS: Record<string, number> = {
  'Plastic': 1.5,
  'Paper': 0.9,
  'Glass': 0.7,
  'Metal': 2.2,
  'Copper': 3.5,
  'Aluminium': 4.1,
  'Electronic': 2.8,
  'Organic': 0.5,
  'Default': 1.0
};

export const MOCK_BUYERS = [
  { id: 'b1', buyerName: 'EcoRecycle Corp', material: 'Plastic', ratePerKg: 0.5, location: 'Downtown Hub', contactNumber: '+1 (555) 123-4567', coords: { lat: 37.7749, lng: -122.4194 } },
  { id: 'b2', buyerName: 'MetalWorks Ltd', material: 'Copper', ratePerKg: 5.2, location: 'Industrial Zone', contactNumber: '+1 (555) 987-6543', coords: { lat: 37.7858, lng: -122.4064 } },
  { id: 'b3', buyerName: 'Green Fiber NGO', material: 'Paper', ratePerKg: 0.15, location: 'Community Center', contactNumber: '+1 (555) 444-3322', coords: { lat: 37.7649, lng: -122.4294 } },
  { id: 'b4', buyerName: 'Urban Glass Solutions', material: 'Glass', ratePerKg: 0.3, location: 'North District', contactNumber: '+1 (555) 111-9988', coords: { lat: 37.8049, lng: -122.4094 } },
  { id: 'b5', buyerName: 'Tech Salvage', material: 'Electronic', ratePerKg: 2.5, location: 'East Tech Park', contactNumber: '+1 (555) 222-3333', coords: { lat: 37.7749, lng: -122.3894 } },
  { id: 'b6', buyerName: 'Scrap Kings', material: 'Aluminium', ratePerKg: 1.8, location: 'West Yard', contactNumber: '+1 (555) 777-0000', coords: { lat: 37.7549, lng: -122.4494 } }
];

export const APP_THEME = {
  primary: 'emerald-500',
  primaryDark: 'emerald-600',
  bgDark: 'slate-950',
  bgCard: 'slate-900',
  textMuted: 'slate-400'
};
