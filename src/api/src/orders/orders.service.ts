import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { AuditService } from 'src/audit/audit.service';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name)
constructor(
  @InjectRepository(Order) 
  private readonly orderRepository: Repository<Order>,
  private readonly auditService: AuditService,
  private readonly queueService: QueueService,
) {}

async create(order: Partial<Order>, user: any) {
    try {
      const savedOrder = await this.orderRepository.save(order);
      await this.queueService.sendOrderCreated(savedOrder.id);

      await this.auditService.recordEvent({
        orderId: savedOrder.id.toString(),
        type: 'ORDER_CREATED',
        userEmail: user?.email,
        data: {
          customerId: savedOrder.customerId,
          total: savedOrder.total,
          status: savedOrder.status,
        },
      });

      this.logger.log(`Order created with id ${savedOrder.id}`);

       return savedOrder;
        } catch (error) {
          if (error instanceof Error) {
            this.logger.error('Error creating order', error.stack);
          } else {
            this.logger.error('Error creating order', String(error));
          }

          throw error;
        }
      }

    findAll() {
      return this.orderRepository.find();
    }

}
