import { NavigatedData, Page } from '@nativescript/core';
import { DashboardViewModel } from './dashboard-view-model';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

let storageService: StorageService;
let authService: AuthService;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    
    if (!storageService) {
        const databaseService = new DatabaseService();
        storageService = new StorageService(databaseService);
    }
    
    if (!authService) {
        authService = new AuthService();
    }
    
    page.bindingContext = new DashboardViewModel(storageService, authService);
}