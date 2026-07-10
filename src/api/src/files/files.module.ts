import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
  imports: [AuditModule], // Import the AuditModule to use its services in the FilesModule
})
export class FilesModule {}
