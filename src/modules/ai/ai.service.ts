import { ChatGoogle } from '@langchain/google';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model: ChatGoogle;

  constructor(private readonly config: ConfigService) {
    this.model = new ChatGoogle({
      // Troque o modelo pelo .env (GEMINI_MODEL) sem mexer no codigo.
      model: this.config.get<string>('GEMINI_MODEL') ?? 'gemini-3.1-flash-lite',
      apiKey: this.config.getOrThrow<string>('GOOGLE_API_KEY'),
      temperature: 0.7,
      maxRetries: 1,
    });
  }

  async ask(question: string) {
    try {
      const response = await this.model.invoke(question, {
        timeout: 30_000,
      });
      return {
        answer: response.text,
      };
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Erro ao consultar a IA',
      );
    }
  }
}
