import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name)

  constructor(
    private readonly auditService: AuditService,
  ) {}

 async uploadFile(file: any, orderId?: string, user?: any) {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachments';

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerClient =
      blobServiceClient.getContainerClient(containerName);

    const safeOrderId = orderId || 'unassigned';

    const blobName = `${safeOrderId}/${Date.now()}-${file.originalname}`;

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    await this.auditService.recordEvent({
      orderId: safeOrderId,
      type: 'FILE_UPLOADED',
      userEmail: user?.email,
      data: {
        fileName: file.originalname,
        blobName,
        contentType: file.mimetype,
        size: file.size,
      },
    });

    this.logger.log(
      `Archivo ${file.originalname} subido para la orden ${safeOrderId}`,
    );

    return {
      orderId: safeOrderId,
      fileName: file.originalname,
      blobName,
      size: file.size,
      contentType: file.mimetype,
      url: blockBlobClient.url,
      status: 'Uploaded',
    };
  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(
        `Error subiendo archivo ${file?.originalname}`,
        error.stack,
      );
    } else {
      this.logger.error(
        `Error subiendo archivo ${file?.originalname}`,
        String(error),
      );
    }

    throw error;
  }
}


 async listFiles(orderId?: string) {
    const connectionString =
      process.env.AZURE_STORAGE_CONNECTION_STRING!;

    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachments';

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerClient =
      blobServiceClient.getContainerClient(containerName);

    const prefix = orderId ? `${orderId}/` : '';

    const files: any[] = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      files.push({
        name: blob.name,
        url: containerClient.getBlockBlobClient(blob.name).url,
        size: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        createdOn: blob.properties.createdOn,
      });
    }

    return files;
  }
}