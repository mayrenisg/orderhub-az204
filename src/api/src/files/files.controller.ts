import {
 Controller,
 Post,
 UploadedFile,
 UseInterceptors,
 Body,
 Get,
 Query,
 Req,
 UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('files')
export class FilesController {
 constructor(private readonly filesService: FilesService) {}

 @UseInterceptors(FileInterceptor('file'))
 @UseGuards(AuthGuard('jwt'))
@Post()
 async uploadFile(
  @UploadedFile() file: any,
  @Body('orderId') orderId: string,
  @Req() req: any 
 ) {
   return this.filesService.uploadFile(file, orderId, req.user);
 }
 
 @Get()
  getFiles(@Query('orderId') orderId?: string) {
    return this.filesService.listFiles(orderId);
  }
}