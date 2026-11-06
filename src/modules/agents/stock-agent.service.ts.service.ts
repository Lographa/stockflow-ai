import { Injectable } from '@nestjs/common';
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

@Injectable()
export class StockAgentServiceTsService {
  getPedido = tool((input) => `Buscar pedido ${input.pedido}`, {
    name: 'get_pedido',
    description: 'Buscador de pedido',
    schema: z.object({
      pedido: z.string().describe('o pedido que deve buscar'),
    }),
  });

  agent = createAgent({
    model: 'google:gemini-2.5-flash-lite',
    tools: [this.getPedido],
  });
}
