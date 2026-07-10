import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './health/health.module';
import { SecretsModule } from './secrets/secrets.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { FilesModule } from './files/files.module';
import { QueueService } from './queue/queue.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

   TypeOrmModule.forRoot({
type: 'mssql',
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 1433),
username: process.env.DB_USERNAME,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
autoLoadEntities: true,
synchronize: true, // solo para laboratorio
options: {
encrypt: true,
trustServerCertificate: false,
},
}),

    HealthModule,
    SecretsModule,
    UserModule,
    AuthModule,
    OrdersModule,
    AuditModule,
    FilesModule,
    QueueModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}