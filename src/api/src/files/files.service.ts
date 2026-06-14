import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
@Injectable()
export class FilesService {
 async uploadFile(file: any, orderId?: string) {
   const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
   const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachments';
   const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
   const containerClient = blobServiceClient.getContainerClient(containerName);
   const safeOrderId = orderId || 'unassigned';
   const blobName = `${safeOrderId}/${Date.now()}-${file.originalname}`;
   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
   await blockBlobClient.uploadData(file.buffer, {
blobHTTPHeaders: { blobContentType: file.mimetype },
   });
   return {
orderId: safeOrderId,
fileName: file.originalname,
blobName,
size: file.size,
contentType: file.mimetype,
url: blockBlobClient.url,
status: 'Uploaded',
   };
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