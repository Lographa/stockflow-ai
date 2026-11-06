import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minStock: number;
}

const COLUMNS = `
  id, sku, name, description,
  price, quantity, min_stock AS minStock
`;

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  /** Todos os produtos ativos (exclui os excluidos logicamente). */
  async findAll(): Promise<Product[]> {
    const rows = await this.db.query<Product>(
      `SELECT ${COLUMNS} FROM products WHERE deleted_at IS NULL ORDER BY name`,
    );
    return rows.map((row) => this.normalize(row));
  }

  /** Produtos ativos com estoque atual <= estoque minimo. */
  async findLowStock(): Promise<Product[]> {
    const rows = await this.db.query<Product>(
      `SELECT ${COLUMNS} FROM products
       WHERE deleted_at IS NULL AND quantity <= min_stock
       ORDER BY (min_stock - quantity) DESC, name`,
    );
    return rows.map((row) => this.normalize(row));
  }

  // DECIMAL chega como string do driver.
  private normalize(row: Product): Product {
    return { ...row, price: Number(row.price) };
  }
}
