export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
}

export interface Unit {
  id: string;
  nameEn: string;
  nameBn: string;
  symbol: string;
  multiplier: number;
  isBase: boolean;
  categoryId: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  iconName: string;
  order?: number;
}

export type CategoryType = string;

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

export interface VisibleCategoriesSettings {
  deviceId: string;
  visibleCategories: string[];
  updatedAt: any;
}
