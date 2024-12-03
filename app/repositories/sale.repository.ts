import { Injectable } from '@nativescript/core';
import { DatabaseService } from '../services/database.service';
import { Sale } from '../models/sale.model';
import { queryAll, queryOne, executeTransaction } from '../utils/database.utils';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONSTANTS } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class SaleRepository {
    constructor(private databaseService: DatabaseService) {}

    async create(sale: Sale): Promise<string> {
        const id = uuidv4();
        const query = `INSERT INTO ${APP_CONSTANTS.DATABASE.TABLES.SALES}
            (id, shoeId, shoeName, size, buyerName, phoneNumber, quantity,
             sellingPrice, amountPaid, date, purchaseCost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            id, sale.shoeId, sale.shoeName, sale.size, sale.buyerName,
            sale.phoneNumber, sale.quantity, sale.sellingPrice,
            sale.amountPaid, sale.date.toISOString(), sale.purchaseCost
        ];

        await executeTransaction(this.databaseService.db, [query], [params]);
        return id;
    }

    async findAll(): Promise<Sale[]> {
        const sales = await queryAll<any>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}
             ORDER BY date DESC`
        );

        return sales.map(sale => ({
            ...sale,
            date: new Date(sale.date)
        }));
    }

    async findById(id: string): Promise<Sale | null> {
        const sale = await queryOne<any>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}
             WHERE id = ?`,
            [id]
        );

        if (!sale) return null;

        return {
            ...sale,
            date: new Date(sale.date)
        };
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
        const sales = await queryAll<any>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}
             WHERE date BETWEEN ? AND ?
             ORDER BY date DESC`,
            [startDate.toISOString(), endDate.toISOString()]
        );

        return sales.map(sale => ({
            ...sale,
            date: new Date(sale.date)
        }));
    }

    async findByBuyerName(buyerName: string): Promise<Sale[]> {
        const sales = await queryAll<any>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}
             WHERE buyerName LIKE ?
             ORDER BY date DESC`,
            [`%${buyerName}%`]
        );

        return sales.map(sale => ({
            ...sale,
            date: new Date(sale.date)
        }));
    }

    async getOutstandingBalances(): Promise<Sale[]> {
        const sales = await queryAll<any>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}
             WHERE amountPaid < (sellingPrice * quantity)
             ORDER BY date DESC`
        );

        return sales.map(sale => ({
            ...sale,
            date: new Date(sale.date)
        }));
    }

    async getTotalRevenue(): Promise<number> {
        const result = await queryOne<{ total: number }>(
            this.databaseService.db,
            `SELECT SUM(sellingPrice * quantity) as total
             FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}`
        );
        return result?.total || 0;
    }

    async getTotalProfit(): Promise<number> {
        const result = await queryOne<{ total: number }>(
            this.databaseService.db,
            `SELECT SUM((sellingPrice - purchaseCost) * quantity) as total
             FROM ${APP_CONSTANTS.DATABASE.TABLES.SALES}`
        );
        return result?.total || 0;
    }
}