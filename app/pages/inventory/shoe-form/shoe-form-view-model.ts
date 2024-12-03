import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { StorageService } from '../../../services/storage.service';
import { Shoe, ShoeSize } from '../../../models/shoe.model';
import { Validators } from '../../../utils/validators';

export class ShoeFormViewModel extends Observable {
    shoe: Shoe;
    isEditing: boolean;
    errorMessage: string = '';

    constructor(private storageService: StorageService, context: any) {
        super();
        
        this.isEditing = context?.mode === 'edit';
        this.shoe = this.isEditing ? { ...context.shoe } : this.getEmptyShoe();
    }

    private getEmptyShoe(): Shoe {
        return {
            name: '',
            imageUrl: '',
            purchaseCost: 0,
            sellingPrice: 0,
            lowStockThreshold: 5,
            sizes: []
        };
    }

    onAddSize() {
        const sizes = [...this.shoe.sizes];
        sizes.push({ size: '', quantity: 0 });
        this.shoe.sizes = sizes;
        this.notifyPropertyChange('shoe', this.shoe);
    }

    onRemoveSize(args: any) {
        const index = this.shoe.sizes.indexOf(args.object.bindingContext);
        const sizes = [...this.shoe.sizes];
        sizes.splice(index, 1);
        this.shoe.sizes = sizes;
        this.notifyPropertyChange('shoe', this.shoe);
    }

    async onSave() {
        if (!this.validateForm()) {
            return;
        }

        try {
            if (this.isEditing) {
                await this.storageService.updateShoe(this.shoe);
            } else {
                await this.storageService.addShoe(this.shoe);
            }
            Frame.topmost().goBack();
        } catch (error) {
            console.error('Error saving shoe:', error);
            this.set('errorMessage', 'Failed to save shoe. Please try again.');
        }
    }

    private validateForm(): boolean {
        if (!this.shoe.name.trim()) {
            this.set('errorMessage', 'Please enter a shoe name');
            return false;
        }

        if (!Validators.isPositiveNumber(this.shoe.purchaseCost)) {
            this.set('errorMessage', 'Please enter a valid purchase cost');
            return false;
        }

        if (!Validators.isPositiveNumber(this.shoe.sellingPrice)) {
            this.set('errorMessage', 'Please enter a valid selling price');
            return false;
        }

        if (this.shoe.sellingPrice <= this.shoe.purchaseCost) {
            this.set('errorMessage', 'Selling price must be higher than purchase cost');
            return false;
        }

        if (!Validators.isPositiveNumber(this.shoe.lowStockThreshold)) {
            this.set('errorMessage', 'Please enter a valid low stock threshold');
            return false;
        }

        if (this.shoe.sizes.length === 0) {
            this.set('errorMessage', 'Please add at least one size');
            return false;
        }

        for (const size of this.shoe.sizes) {
            if (!size.size.trim() || !Validators.isPositiveNumber(size.quantity)) {
                this.set('errorMessage', 'Please enter valid size and quantity for all sizes');
                return false;
            }
        }

        return true;
    }

    async onUploadImage() {
        // In a real app, implement image upload functionality
        // For now, we'll just use a placeholder URL
        this.shoe.imageUrl = 'https://via.placeholder.com/150';
        this.notifyPropertyChange('shoe', this.shoe);
    }
}