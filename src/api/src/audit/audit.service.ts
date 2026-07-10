import { Injectable, Logger } from '@nestjs/common';
import { CosmosClient } from '@azure/cosmos';

@Injectable()
export class AuditService {
  private client: CosmosClient;
      private readonly logger = new Logger(AuditService.name)

  constructor() {
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT!,
      key: process.env.COSMOS_KEY!,
    });
  }
  private getContainer() {
    const database = this.client.database(process.env.COSMOS_DATABASE_ID!);
    return database.container(process.env.COSMOS_CONTAINER_ID!);
  }

  async recordEvent(event: {
    orderId: string;
    type: string;
    userEmail?: string;
    data?: Record<string, any>;
  }) {
    const container = this.getContainer();
    const document = {
      id: `${event.type}-${event.orderId}-${Date.now()}`,
      orderId: event.orderId,
      type: event.type,
      userEmail: event.userEmail || 'system',
      data: event.data || {},
      createdAt: new Date().toISOString(),
    };
    try{
    await container.items.create(document);

    this.logger.log(`Registro de auditoria ${document.id}`);
    return document;
    } catch (error) {
          if (error instanceof Error) {
            this.logger.error('Error al registrar auditoria', error.stack);
          } else {
            this.logger.error('Error al registrar auditoria', String(error));
          }

          throw error;
        }
  }

  async findByOrderId(orderId: string) {
    const container = this.getContainer();
    const query = {
      query: 'SELECT * FROM c WHERE c.orderId = @orderId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@orderId', value: orderId }],
    };
        const { resources } = await container.items.query(query).fetchAll();
        return resources;
    }

}