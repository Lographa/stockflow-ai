import { Module } from '@nestjs/common';
import { StockAgentServiceTsService } from './modules/agents/stock-agent.service.ts.service';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [AiModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [StockAgentServiceTsService],
})
export class AppModule {}
