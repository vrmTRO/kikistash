import { Observable } from '@nativescript/core';
import { Frame, confirm } from '@nativescript/core';
import { StorageService } from '../../../services/storage.service';
import { Shoe } from '../../../models/shoe.model';
import { APP_CONSTANTS } from '../../../utils/constants';

export class ShoeDetailViewModel extends Observable {
    shoe: Shoe;

    constructor(private storageService: StorageService, shoe: Shoe) {
        super();
        this.shoe = shoe;
    }

    onEdit() {
        Frame.topmost().navigate({
            moduleName: 'pages/inventory/shoe-form/shoe-form-page',
            context: { mode: 'edit', shoe: this.shoe }
        });
    }

    async onDelete() {
        const result = await confirm({
            title: 'Delete Shoe',
            message: 'Are you sure you want to delete this shoe?',
            okButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        });

        if (result) {
            try {
                await this.storageService.deleteShoe(this.shoe.id);
                Frame.topmost().goBack();
            } catch (error) {
                console.error('Error deleting shoe:', error);
            }
        }
    }

    onAddToSale() {
        Frame.topmost().navigate({
            moduleName: APP_CONSTANTS.ROUTES.SALES,
            context: { shoe: this.shoe }
        });
    }
}