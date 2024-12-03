import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { StorageService } from '../../services/storage.service';
import { Shoe } from '../../models/shoe.model';

export class InventoryViewModel extends Observable {
    private storageService: StorageService;
    shoes: Shoe[] = [];
    searchQuery: string = '';

    constructor(storageService: StorageService) {
        super();
        this.storageService = storageService;
        this.loadShoes();
    }

    async loadShoes() {
        try {
            const shoes = await this.storageService.getShoes();
            this.set('shoes', this.processShoes(shoes));
        } catch (error) {
            console.error('Error loading shoes:', error);
        }
    }

    private processShoes(shoes: Shoe[]): any[] {
        return shoes.map(shoe => ({
            ...shoe,
            totalQuantity: shoe.sizes.reduce((sum, size) => sum + size.quantity, 0)
        }));
    }

    onSearch() {
        const query = this.searchQuery.toLowerCase();
        const allShoes = this.processShoes(this.shoes);
        const filteredShoes = allShoes.filter(shoe => 
            shoe.name.toLowerCase().includes(query)
        );
        this.set('shoes', filteredShoes);
    }

    onClearSearch() {
        this.set('searchQuery', '');
        this.loadShoes();
    }

    onAddShoe() {
        Frame.topmost().navigate({
            moduleName: 'pages/inventory/shoe-form/shoe-form-page',
            context: { mode: 'add' }
        });
    }

    onEditShoe(args: any) {
        const shoe = args.object.bindingContext;
        Frame.topmost().navigate({
            moduleName: 'pages/inventory/shoe-form/shoe-form-page',
            context: { mode: 'edit', shoe }
        });
    }

    onShoeSelect(args: any) {
        const shoe = args.view.bindingContext;
        Frame.topmost().navigate({
            moduleName: 'pages/inventory/shoe-detail/shoe-detail-page',
            context: { shoe }
        });
    }
}