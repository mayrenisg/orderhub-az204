import {
 Controller,
 Post,
 UploadedFile,
 UseInterceptors,
 Body,
 Get,
 Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
 constructor(private readonly filesService: FilesService) {}

 @Post()
 @UseInterceptors(FileInterceptor('file'))
 async uploadFile(
  @UploadedFile() file: any,
  @Body('orderId') orderId: string,
 ) {
   return this.filesService.uploadFile(file, orderId);
 }
 
 @Get()
  getFiles(@Query('orderId') orderId?: string) {
    return this.filesService.listFiles(orderId);
  }
}