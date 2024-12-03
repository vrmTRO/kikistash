import { NavigatedData, Page } from '@nativescript/core';
import { InventoryViewModel } from './inventory-view-model';
import { StorageService } from '../../services/storage.service';
import { DatabaseService } from '../../services/database.service';

let storageService: StorageService;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    
    if (!storageService) {
        const databaseService = new DatabaseService();
        storageService = new StorageService(databaseService);
    }
    
    page.bindingContext = new InventoryViewModel(storageService);
}