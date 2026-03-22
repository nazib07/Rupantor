export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
}

export interface Unit {
  id: string;
  name: string;
  nameBn?: string;
  symbol?: string;
  multiplier: number;
  isBase?: boolean;
  category: string;
}

export type CategoryType = 
  | 'Length' 
  | 'Weight' 
  | 'Temperature' 
  | 'Area' 
  | 'Volume' 
  | 'Time' 
  | 'Speed' 
  | 'Digital Storage'
  | 'Currency';

export interface HistoryItem {
  id: string;
  deviceId: string;
  fromUnit: string;
  toUnit: string;
  fromValue: number;
  toValue: number;
  category: string;
  timestamp: any;
}

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}
