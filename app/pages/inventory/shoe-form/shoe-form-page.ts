import { NavigatedData, Page } from '@nativescript/core';
import { ShoeFormViewModel } from './shoe-form-view-model';
import { StorageService } from '../../../services/storage.service';
import { DatabaseService } from '../../../services/database.service';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    const databaseService = new DatabaseService();
    const storageService = new StorageService(databaseService);
    page.bindingContext = new ShoeFormViewModel(storageService, page.navigationContext);
}