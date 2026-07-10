import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getOrders(): Promise<Order[]>;
    create(body: Partial<Order>, req: any): Promise<Partial<Order> & Order>;
    getAttachments(id: number): Promise<any[]>;
}
