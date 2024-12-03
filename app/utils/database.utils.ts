import { Database } from 'nativescript-sqlite';

export async function executeTransaction(db: Database, queries: string[], params: any[][] = []): Promise<void> {
    await db.execSQL('BEGIN TRANSACTION');
    try {
        for (let i = 0; i < queries.length; i++) {
            await db.execSQL(queries[i], params[i] || []);
        }
        await db.execSQL('COMMIT');
    } catch (error) {
        await db.execSQL('ROLLBACK');
        throw error;
    }
}

export async function queryOne<T>(db: Database, query: string, params: any[] = []): Promise<T | null> {
    const result = await db.get(query, params);
    return result || null;
}

export async function queryAll<T>(db: Database, query: string, params: any[] = []): Promise<T[]> {
    return await db.all(query, params);
}