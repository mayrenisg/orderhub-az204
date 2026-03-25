export interface Order {
    id: string;
    customerId: string;
    total: number;
    status: string;
}
export declare class OrdersService {
    private readonly orders;
    findAll(): Order[];
    create(order: Omit<Order, 'id'>): Order;
}
