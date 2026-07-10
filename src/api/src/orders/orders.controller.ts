import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin','operator', 'viewer')
  @Get()
  getOrders() {
      return this.ordersService.findAll();
    }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @Roles('admin','operator')
  create(@Body() body: Partial<Order>, @Req() req) {
    return this.ordersService.create(body, req.user);
  }
}
