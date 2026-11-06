import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { StockAgentServiceTsService } from './stock-agent.service';

@Module({
  imports: [ProductsModule],
  providers: [StockAgentServiceTsService],
  exports: [StockAgentServiceTsService],
})
export class AgentsModule {}
