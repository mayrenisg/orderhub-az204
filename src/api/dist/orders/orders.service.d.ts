import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { AuditService } from 'src/audit/audit.service';
import { QueueService } from 'src/queue/queue.service';
import { FilesService } from 'src/files/files.service';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly auditService;
    private readonly queueService;
    private readonly filesService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, auditService: AuditService, queueService: QueueService, filesService: FilesService);
    create(order: Partial<Order>, user: any): Promise<Partial<Order> & Order>;
    findAll(): Promise<Order[]>;
    getAttachments(orderId: number): Promise<any[]>;
}
