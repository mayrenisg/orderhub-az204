import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuditModule } from 'src/audit/audit.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
    imports: [TypeOrmModule.forFeature([Order]),AuditModule, QueueModule],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
