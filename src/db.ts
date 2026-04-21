import Dexie, { Table } from 'dexie';
import { HistoryItem, VisibleCategoriesSettings } from './types';

export class RupantorDB extends Dexie {
  history!: Table<HistoryItem>;
  settings!: Table<VisibleCategoriesSettings, string>;

  constructor() {
    super('RupantorDB');
    this.version(1).stores({
      history: '++id, deviceId, category, timestamp' // Primary key and indexed fields
    });
    // Stores UI settings per device (so it survives app restarts).
    this.version(2).stores({
      history: '++id, deviceId, category, timestamp',
      settings: 'deviceId'
    });
  }
}

export const db_local = new RupantorDB();
