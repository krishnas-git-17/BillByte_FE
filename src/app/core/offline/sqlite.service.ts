import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';
import { IdbStorageService } from './idb-storage.service';
import { AuthService } from '../authservices/auth.service';

@Injectable({ providedIn: 'root' })
export class SqliteService {

  private db: Database | null = null;
  private DB_KEY = '';

  constructor(
    private storage: IdbStorageService,
    private auth: AuthService
  ) {}

  async init(): Promise<void> {
    if (this.db) return;

    const restaurantId = this.auth.getRestaurantId();
    if (!restaurantId) {
      throw new Error('SQLite init without restaurantId');
    }

    this.DB_KEY = `pos-${restaurantId}.sqlite`;

    const SQL = await initSqlJs({
      locateFile: (file: string) => `/sqlite/${file}`
    });

    const saved = await this.storage.get(this.DB_KEY);
    this.db = saved ? new SQL.Database(saved) : new SQL.Database();

    await this.createTables();
    await this.persist();
  }

  private async createTables(): Promise<void> {
    await this.run(`
      CREATE TABLE IF NOT EXISTS table_preferences (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL,
        synced INTEGER DEFAULT 1
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS sidebar_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT NOT NULL
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS table_state (
        tableId TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        startTime TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS active_table_items (
        tableId TEXT NOT NULL,
        itemId INTEGER NOT NULL,
        payload TEXT NOT NULL,
        synced INTEGER DEFAULT 1,
        PRIMARY KEY (tableId, itemId)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        menuId TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        vegType TEXT,
        status TEXT,
        price REAL,
        imageUrl TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS completed_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurantId INTEGER NOT NULL,
        invoiceNo TEXT,
        payload TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('SQLite DB not initialized');
    }

    this.db.run(sql, params);
    await this.persist();
  }

  query(sql: string, params: any[] = []) {
    if (!this.db) {
      throw new Error('SQLite DB not initialized');
    }

    return this.db.exec(sql, params);
  }

  private async persist(): Promise<void> {
    if (!this.db) return;

    const data = this.db.export();
    await this.storage.set(this.DB_KEY, data);
  }
}
