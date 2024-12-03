import { Injectable } from '@nativescript/core';
import * as SQLite from 'nativescript-sqlite';
import { executeTransaction } from '../utils/database.utils';
import { APP_CONSTANTS } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private _db: SQLite.DB;

    get db(): SQLite.DB {
        if (!this._db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return this._db;
    }

    async init(): Promise<void> {
        try {
            this._db = await new SQLite(APP_CONSTANTS.DATABASE.NAME);
            await this.createTables();
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        const queries = [
            `CREATE TABLE IF NOT EXISTS ${APP_CONSTANTS.DATABASE.TABLES.SHOES} (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                imageUrl TEXT,
                purchaseCost REAL NOT NULL,
                sellingPrice REAL NOT NULL,
                lowStockThreshold INTEGER NOT NULL,
                createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES} (
                id TEXT PRIMARY KEY,
                shoeId TEXT NOT NULL,
                size TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(shoeId) REFERENCES ${APP_CONSTANTS.DATABASE.TABLES.SHOES}(id)
                ON DELETE CASCADE
            )`,
            
            `CREATE TABLE IF NOT EXISTS ${APP_CONSTANTS.DATABASE.TABLES.SALES} (
                id TEXT PRIMARY KEY,
                shoeId TEXT NOT NULL,
                shoeName TEXT NOT NULL,
                size TEXT NOT NULL,
                buyerName TEXT NOT NULL,
                phoneNumber TEXT,
                quantity INTEGER NOT NULL,
                sellingPrice REAL NOT NULL,
                amountPaid REAL NOT NULL,
                date TEXT NOT NULL,
                purchaseCost REAL NOT NULL,
                createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(shoeId) REFERENCES ${APP_CONSTANTS.DATABASE.TABLES.SHOES}(id)
                ON DELETE CASCADE
            )`
        ];

        await executeTransaction(this.db, queries);
    }

    async close(): Promise<void> {
        if (this._db) {
            await this._db.close();
        }
    }
}