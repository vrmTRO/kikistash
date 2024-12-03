import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { APP_CONSTANTS } from '../../utils/constants';

export class DashboardViewModel extends Observable {
    private storageService: StorageService;
    private authService: AuthService;

    totalInventoryValue: number = 0;
    totalSalesRevenue: number = 0;
    totalProfit: number = 0;
    outstandingBalances: number = 0;
    recentSales: any[] = [];
    alerts: any[] = [];
    hasAlerts: boolean = false;

    constructor(storageService: StorageService, authService: AuthService) {
        super();
        this.storageService = storageService;
        this.authService = authService;
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            const [shoes, sales] = await Promise.all([
                this.storageService.getShoes(),
                this.storageService.getSales()
            ]);

            // Calculate totals
            this.totalInventoryValue = shoes.reduce((total, shoe) => {
                const stockValue = shoe.sizes.reduce((sum, size) => 
                    sum + (size.quantity * shoe.purchaseCost), 0);
                return total + stockValue;
            }, 0);

            this.totalSalesRevenue = sales.reduce((total, sale) => 
                total + (sale.sellingPrice * sale.quantity), 0);

            this.totalProfit = sales.reduce((total, sale) => 
                total + ((sale.sellingPrice - sale.purchaseCost) * sale.quantity), 0);

            this.outstandingBalances = sales.reduce((total, sale) => 
                total + ((sale.sellingPrice * sale.quantity) - sale.amountPaid), 0);

            // Get recent sales
            this.recentSales = sales
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5);

            // Check for alerts
            this.generateAlerts(shoes, sales);

            this.notifyPropertyChange('totalInventoryValue', this.totalInventoryValue);
            this.notifyPropertyChange('totalSalesRevenue', this.totalSalesRevenue);
            this.notifyPropertyChange('totalProfit', this.totalProfit);
            this.notifyPropertyChange('outstandingBalances', this.outstandingBalances);
            this.notifyPropertyChange('recentSales', this.recentSales);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    private generateAlerts(shoes: any[], sales: any[]) {
        const alerts = [];

        // Check for low stock
        shoes.forEach(shoe => {
            shoe.sizes.forEach(size => {
                if (size.quantity <= shoe.lowStockThreshold) {
                    alerts.push({
                        message: `Low stock alert: ${shoe.name} (Size ${size.size}) - Only ${size.quantity} left`
                    });
                }
            });
        });

        // Check for outstanding balances
        sales.forEach(sale => {
            if (sale.amountPaid < (sale.sellingPrice * sale.quantity)) {
                alerts.push({
                    message: `Outstanding balance: ${sale.buyerName} owes ${(sale.sellingPrice * sale.quantity) - sale.amountPaid} for ${sale.shoeName}`
                });
            }
        });

        this.alerts = alerts;
        this.hasAlerts = alerts.length > 0;
        this.notifyPropertyChange('alerts', this.alerts);
        this.notifyPropertyChange('hasAlerts', this.hasAlerts);
    }

    navigateToAddShoe() {
        Frame.topmost().navigate({
            moduleName: APP_CONSTANTS.ROUTES.INVENTORY
        });
    }

    navigateToNewSale() {
        Frame.topmost().navigate({
            moduleName: APP_CONSTANTS.ROUTES.SALES
        });
    }

    async onLogout() {
        try {
            await this.authService.logout();
            Frame.topmost().navigate({
                moduleName: APP_CONSTANTS.ROUTES.LOGIN,
                clearHistory: true
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}