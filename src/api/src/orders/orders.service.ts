import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { AuditService } from 'src/audit/audit.service';
import { QueueService } from 'src/queue/queue.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name)
constructor(
  @InjectRepository(Order) 
  private readonly orderRepository: Repository<Order>,
  private readonly auditService: AuditService,
  private readonly queueService: QueueService,
  private readonly filesService: FilesService,
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

     async getAttachments(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.filesService.listFiles(orderId.toString());
  }

}
