import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { HealthModule } from './health/health.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [OrdersModule, HealthModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
