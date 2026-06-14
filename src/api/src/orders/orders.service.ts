import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
constructor(
  @InjectRepository(Order) 
  private readonly orderRepository: Repository<Order>,
) {}

create(orderDto: Partial<Order>) {
  const order = this.orderRepository.create(orderDto);
  return this.orderRepository.save(order);
}
findAll() {
  return this.orderRepository.find();
}

}
