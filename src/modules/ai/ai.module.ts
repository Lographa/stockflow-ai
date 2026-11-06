import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [AgentsModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
