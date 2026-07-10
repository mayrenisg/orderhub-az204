import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

   @Get('debug/error')
  throwError() {
    throw new Error('Error controlado para validar Application Insights');
  }

  @Get('debug/slow')
  async slowRequest() {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      message: 'Respuesta lenta simulada',
    };
  }
}
