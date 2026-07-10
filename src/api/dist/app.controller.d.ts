import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    throwError(): void;
    slowRequest(): Promise<{
        message: string;
    }>;
}
