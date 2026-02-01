import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({ providedIn: 'root' })
export class IdbStorageService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('billbyte-pos', 1, {
      upgrade(db: IDBPDatabase) {
        db.createObjectStore('files');
      }
    });
  }

  async get(key: string): Promise<Uint8Array | null> {
    const db = await this.dbPromise;
    return (await db.get('files', key)) ?? null;
  }

  async set(key: string, data: Uint8Array): Promise<void> {
    const db = await this.dbPromise;
    await db.put('files', data, key);
  }
}
