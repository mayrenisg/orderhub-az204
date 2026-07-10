"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orders_entity_1 = require("./orders.entity");
const typeorm_2 = require("typeorm");
const audit_service_1 = require("../audit/audit.service");
const queue_service_1 = require("../queue/queue.service");
let OrdersService = OrdersService_1 = class OrdersService {
    orderRepository;
    auditService;
    queueService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(orderRepository, auditService, queueService) {
        this.orderRepository = orderRepository;
        this.auditService = auditService;
        this.queueService = queueService;
    }
    async create(order, user) {
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
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Error creating order', error.stack);
            }
            else {
                this.logger.error('Error creating order', String(error));
            }
            throw error;
        }
    }
    findAll() {
        return this.orderRepository.find();
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService,
        queue_service_1.QueueService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map