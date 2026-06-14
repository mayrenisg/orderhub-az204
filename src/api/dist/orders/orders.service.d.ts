import { Order } from './orders.entity';
import { Repository } from 'typeorm';
export declare class OrdersService {
    private readonly orderRepository;
    constructor(orderRepository: Repository<Order>);
    create(orderDto: Partial<Order>): Promise<Order>;
    findAll(): Promise<Order[]>;
}
