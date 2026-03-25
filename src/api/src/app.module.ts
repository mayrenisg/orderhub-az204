import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [OrdersModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
