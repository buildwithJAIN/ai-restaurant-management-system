// src/app/models/menu-Item.model.ts
export interface MenuItem {
    id?: number;
    itemName: string;
    category: string;
    price: number;
    totalAvailable: number;
    description?: string;
    imageUrl?: string;
    available: boolean;
}
