import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { StockAgentServiceTsService } from '../agents/stock-agent.service';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly stockAgent: StockAgentServiceTsService,
  ) {}

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

  // Pergunta ao assistente de estoque (usa as consultas reais do banco).
  @Get('stock')
  async stock(@Query('question') question: string) {
    if (!question?.trim()) {
      throw new BadRequestException('pergunta obrigatoria');
    }

    return this.stockAgent.ask(question);
  }
}
