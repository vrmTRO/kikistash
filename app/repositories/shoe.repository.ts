import { Injectable } from '@nativescript/core';
import { DatabaseService } from '../services/database.service';
import { Shoe, ShoeSize } from '../models/shoe.model';
import { queryAll, queryOne, executeTransaction } from '../utils/database.utils';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONSTANTS } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class ShoeRepository {
    constructor(private databaseService: DatabaseService) {}

    async create(shoe: Shoe): Promise<string> {
        const id = uuidv4();
        const queries = [
            `INSERT INTO ${APP_CONSTANTS.DATABASE.TABLES.SHOES} 
            (id, name, imageUrl, purchaseCost, sellingPrice, lowStockThreshold)
            VALUES (?, ?, ?, ?, ?, ?)`,
            ...shoe.sizes.map(() => 
                `INSERT INTO ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES}
                (id, shoeId, size, quantity)
                VALUES (?, ?, ?, ?)`)
        ];

        const params = [
            [id, shoe.name, shoe.imageUrl, shoe.purchaseCost, shoe.sellingPrice, shoe.lowStockThreshold],
            ...shoe.sizes.map(size => [uuidv4(), id, size.size, size.quantity])
        ];

        await executeTransaction(this.databaseService.db, queries, params);
        return id;
    }

    async findAll(): Promise<Shoe[]> {
        const shoes = await queryAll<Shoe>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOES}`
        );

        return Promise.all(shoes.map(async shoe => {
            const sizes = await queryAll<ShoeSize>(
                this.databaseService.db,
                `SELECT size, quantity FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES}
                WHERE shoeId = ?`,
                [shoe.id]
            );
            return { ...shoe, sizes };
        }));
    }

    async findById(id: string): Promise<Shoe | null> {
        const shoe = await queryOne<Shoe>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOES} WHERE id = ?`,
            [id]
        );

        if (!shoe) return null;

        const sizes = await queryAll<ShoeSize>(
            this.databaseService.db,
            `SELECT size, quantity FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES}
            WHERE shoeId = ?`,
            [id]
        );

        return { ...shoe, sizes };
    }

    async update(shoe: Shoe): Promise<void> {
        const queries = [
            `UPDATE ${APP_CONSTANTS.DATABASE.TABLES.SHOES}
            SET name = ?, imageUrl = ?, purchaseCost = ?, sellingPrice = ?,
                lowStockThreshold = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?`,
            `DELETE FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES} WHERE shoeId = ?`,
            ...shoe.sizes.map(() =>
                `INSERT INTO ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES}
                (id, shoeId, size, quantity)
                VALUES (?, ?, ?, ?)`)
        ];

        const params = [
            [shoe.name, shoe.imageUrl, shoe.purchaseCost, shoe.sellingPrice, 
             shoe.lowStockThreshold, shoe.id],
            [shoe.id],
            ...shoe.sizes.map(size => [uuidv4(), shoe.id, size.size, size.quantity])
        ];

        await executeTransaction(this.databaseService.db, queries, params);
    }

    async delete(id: string): Promise<void> {
        const queries = [
            `DELETE FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES} WHERE shoeId = ?`,
            `DELETE FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOES} WHERE id = ?`
        ];
        const params = [[id], [id]];
        await executeTransaction(this.databaseService.db, queries, params);
    }

    async searchByName(query: string): Promise<Shoe[]> {
        const shoes = await queryAll<Shoe>(
            this.databaseService.db,
            `SELECT * FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOES}
            WHERE name LIKE ?`,
            [`%${query}%`]
        );

        return Promise.all(shoes.map(async shoe => {
            const sizes = await queryAll<ShoeSize>(
                this.databaseService.db,
                `SELECT size, quantity FROM ${APP_CONSTANTS.DATABASE.TABLES.SHOE_SIZES}
                WHERE shoeId = ?`,
                [shoe.id]
            );
            return { ...shoe, sizes };
        }));
    }
}