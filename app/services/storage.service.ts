import { Injectable } from '@nativescript/core';
import { DatabaseService } from './database.service';
import { Shoe } from '../models/shoe.model';
import { Sale } from '../models/sale.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private database: DatabaseService) {}

  async initialize(): Promise<void> {
    await this.database.init();
  }

  async addShoe(shoe: Shoe): Promise<string> {
    const id = uuidv4();
    await this.database.db.execSQL(
      `INSERT INTO shoes (id, name, imageUrl, purchaseCost, sellingPrice, lowStockThreshold)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, shoe.name, shoe.imageUrl, shoe.purchaseCost, shoe.sellingPrice, shoe.lowStockThreshold]
    );

    for (const size of shoe.sizes) {
      await this.database.db.execSQL(
        `INSERT INTO shoe_sizes (shoeId, size, quantity)
         VALUES (?, ?, ?)`,
        [id, size.size, size.quantity]
      );
    }

    return id;
  }

  async getShoes(): Promise<Shoe[]> {
    const shoes: Shoe[] = [];
    const shoesResult = await this.database.db.all('SELECT * FROM shoes');
    
    for (const shoeData of shoesResult) {
      const sizes = await this.database.db.all(
        'SELECT size, quantity FROM shoe_sizes WHERE shoeId = ?',
        [shoeData.id]
      );
      
      shoes.push({
        id: shoeData.id,
        name: shoeData.name,
        imageUrl: shoeData.imageUrl,
        purchaseCost: shoeData.purchaseCost,
        sellingPrice: shoeData.sellingPrice,
        lowStockThreshold: shoeData.lowStockThreshold,
        sizes: sizes
      });
    }
    
    return shoes;
  }

  async updateShoe(shoe: Shoe): Promise<void> {
    await this.database.db.execSQL(
      `UPDATE shoes 
       SET name = ?, imageUrl = ?, purchaseCost = ?, sellingPrice = ?, lowStockThreshold = ?
       WHERE id = ?`,
      [shoe.name, shoe.imageUrl, shoe.purchaseCost, shoe.sellingPrice, shoe.lowStockThreshold, shoe.id]
    );

    await this.database.db.execSQL(
      'DELETE FROM shoe_sizes WHERE shoeId = ?',
      [shoe.id]
    );

    for (const size of shoe.sizes) {
      await this.database.db.execSQL(
        `INSERT INTO shoe_sizes (shoeId, size, quantity)
         VALUES (?, ?, ?)`,
        [shoe.id, size.size, size.quantity]
      );
    }
  }

  async deleteShoe(id: string): Promise<void> {
    await this.database.db.execSQL('DELETE FROM shoe_sizes WHERE shoeId = ?', [id]);
    await this.database.db.execSQL('DELETE FROM shoes WHERE id = ?', [id]);
  }

  async addSale(sale: Sale): Promise<string> {
    const id = uuidv4();
    await this.database.db.execSQL(
      `INSERT INTO sales (id, shoeId, shoeName, size, buyerName, phoneNumber, 
                         quantity, sellingPrice, amountPaid, date, purchaseCost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, sale.shoeId, sale.shoeName, sale.size, sale.buyerName, sale.phoneNumber,
       sale.quantity, sale.sellingPrice, sale.amountPaid, sale.date.toISOString(), sale.purchaseCost]
    );

    // Update inventory
    await this.database.db.execSQL(
      `UPDATE shoe_sizes 
       SET quantity = quantity - ? 
       WHERE shoeId = ? AND size = ?`,
      [sale.quantity, sale.shoeId, sale.size]
    );

    return id;
  }

  async getSales(): Promise<Sale[]> {
    const salesResult = await this.database.db.all('SELECT * FROM sales');
    return salesResult.map(sale => ({
      ...sale,
      date: new Date(sale.date)
    }));
  }
}