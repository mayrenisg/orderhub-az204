import {
 Controller,
 Post,
 UploadedFile,
 UseInterceptors,
 Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
 constructor(private readonly filesService: FilesService) {}
 @Post()
 @UseInterceptors(FileInterceptor('file'))
 async uploadFile(
   @UploadedFile() file: Express.Multer.File,
   @Body('orderId') orderId: string,
 ) {
   return this.filesService.uploadFile(file, orderId);
 }
}