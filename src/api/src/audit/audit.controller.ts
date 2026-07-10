import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @UseGuards(AuthGuard('jwt'))
     @Get('orders/:orderId')
  getOrderHistory(
    @Param('orderId') orderId: string,
  ) {
    return this.auditService.findByOrderId(orderId);
  }
}
