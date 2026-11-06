import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  bemVindo(): string {
    return 'hello world';
  }

  @Get('ask')
  async ask(@Query('question') question: string) {
    if (!question?.trim()) {
      throw new BadRequestException('pergunta obrigatoria');
    }

    return this.aiService.ask(question);
  }
}
