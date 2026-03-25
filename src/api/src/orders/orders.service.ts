import { Injectable } from '@nestjs/common';
export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: string;
}
@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [
    { id: '1', customerId: 'cust-001', total: 150, status: 'Pending' },
    { id: '2', customerId: 'cust-002', total: 220, status: 'Completed' },
  ];
  findAll(): Order[] {
    return this.orders;
  }
  create(order: Omit<Order, 'id'>): Order {
    const newOrder: Order = {
      id: Date.now().toString(),
      ...order,
    };
    this.orders.push(newOrder);
    return newOrder;
  }
}
