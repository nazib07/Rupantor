import Dexie, { Table } from 'dexie';
import { HistoryItem } from './types';

export class RupantorDB extends Dexie {
  history!: Table<HistoryItem>;

  constructor() {
    super('RupantorDB');
    this.version(1).stores({
      history: '++id, deviceId, category, timestamp' // Primary key and indexed fields
    });
  }
}

export const db_local = new RupantorDB();
