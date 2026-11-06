import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogle } from '@langchain/google';
import { createAgent } from 'langchain';
import { ProductsService } from '../products/products.service';
import { createStockTools } from './stock-agent.tools';

const SYSTEM_PROMPT = `
Você é um assistente especializado em controle de estoque.
Utilize as consultas disponíveis para obter informações reais do banco.
Nunca invente produtos, quantidades ou valores.
Quando não houver produtos com estoque baixo, informe isso claramente.
Responda em português e de maneira objetiva.
`;

@Injectable()
export class StockAgentServiceTsService {
  private readonly logger = new Logger(StockAgentServiceTsService.name);
  private readonly agent;

  constructor(config: ConfigService, productsService: ProductsService) {
    this.agent = createAgent({
      model: new ChatGoogle({
        model: config.get<string>('GEMINI_MODEL') ?? 'gemini-3.1-flash-lite',
        apiKey: config.getOrThrow<string>('GOOGLE_API_KEY'),
        temperature: 0,
        maxRetries: 1,
      }),
      tools: createStockTools(productsService),
      systemPrompt: SYSTEM_PROMPT,
    });
  }

  async ask(question: string) {
    let answer: string | undefined;
    try {
      const result = await this.agent.invoke(
        { messages: [{ role: 'user', content: question }] },
        { signal: AbortSignal.timeout(60_000) },
      );
      answer = result.messages.at(-1)?.text;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(
        'Falha na comunicacao com o servico de IA.',
      );
    }

    if (typeof answer !== 'string' || !answer.trim()) {
      this.logger.error('Resposta vazia ou inesperada do Gemini');
      throw new BadGatewayException('Resposta inesperada do servico de IA.');
    }
    return { answer };
  }
}
