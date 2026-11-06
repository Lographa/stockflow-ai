import { HttpException } from '@nestjs/common';
import { tool } from 'langchain';
import * as z from 'zod';
import { ProductsService } from '../products/products.service';

// Executa a consulta e devolve JSON para o modelo. Em caso de falha devolve
// apenas uma mensagem segura (sem detalhes internos), para a IA poder avisar
// o usuario em vez de inventar dados.
async function run(query: () => Promise<unknown[]>): Promise<string> {
  try {
    const products = await query();
    return JSON.stringify({ total: products.length, products });
  } catch (error) {
    const message =
      error instanceof HttpException
        ? error.message
        : 'Erro ao consultar o banco de dados.';
    return JSON.stringify({ error: message });
  }
}

export function createStockTools(productsService: ProductsService) {
  const getProducts = tool(() => run(() => productsService.findAll()), {
    name: 'get_products',
    description:
      'Lista todos os produtos ativos cadastrados no estoque (id, sku, nome, descricao, preco, quantidade atual e estoque minimo).',
    schema: z.object({}),
  });

  const getLowStockProducts = tool(
    () => run(() => productsService.findLowStock()),
    {
      name: 'get_low_stock_products',
      description:
        'Lista os produtos ativos com estoque baixo, ou seja, quantidade atual menor ou igual ao estoque minimo.',
      schema: z.object({}),
    },
  );

  return [getProducts, getLowStockProducts];
}
