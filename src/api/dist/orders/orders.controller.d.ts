import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getOrders(): import("./orders.service").Order[];
    createOrder(body: {
        customerId: string;
        total: number;
        status: string;
    }): import("./orders.service").Order;
}
