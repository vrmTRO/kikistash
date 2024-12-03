export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export function parseCurrency(value: string): number {
    const cleanValue = value.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanValue) || 0;
}

export function calculateProfit(sellingPrice: number, purchaseCost: number, quantity: number): number {
    return (sellingPrice - purchaseCost) * quantity;
}

export function calculateBalance(totalAmount: number, amountPaid: number): number {
    return Math.max(0, totalAmount - amountPaid);
}