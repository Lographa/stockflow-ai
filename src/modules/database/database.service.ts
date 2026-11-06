import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';

// Codigos do mysql2/Node que indicam falha de conexao/autenticacao.
const CONNECTION_ERRORS = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
]);

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    // O pool e criado de forma lazy: o app sobe mesmo com o banco fora do ar
    // e o erro de conexao e tratado na primeira consulta.
    this.pool = createPool({
      host: config.get<string>('DB_HOST') ?? 'localhost',
      port: Number(config.get<string>('DB_PORT') ?? 3306),
      user: config.get<string>('DB_USER'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME') ?? 'stockflow_db',
      connectionLimit: 5,
      connectTimeout: 10_000,
      // DECIMAL como string preserva a precisao; convertido no service.
      decimalNumbers: false,
    });
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const [rows] = await this.pool.query(sql, params);
      return rows as T[];
    } catch (error) {
      // Detalhes tecnicos ficam apenas no log do servidor.
      this.logger.error(error);
      const code = (error as { code?: string })?.code ?? '';
      if (CONNECTION_ERRORS.has(code)) {
        throw new ServiceUnavailableException(
          'Nao foi possivel conectar ao banco de dados.',
        );
      }
      throw new InternalServerErrorException(
        'Erro ao executar a consulta no banco de dados.',
      );
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
