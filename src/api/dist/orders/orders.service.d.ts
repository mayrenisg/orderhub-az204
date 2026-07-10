import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { AuditService } from 'src/audit/audit.service';
import { QueueService } from 'src/queue/queue.service';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly auditService;
    private readonly queueService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, auditService: AuditService, queueService: QueueService);
    create(order: Partial<Order>, user: any): Promise<Partial<Order> & Order>;
    findAll(): Promise<Order[]>;
}
