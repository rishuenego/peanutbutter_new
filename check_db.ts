import dotenv from 'dotenv';
dotenv.config();
import { getMany } from './src/config/db.js';

async function main() {
  try {
    const products = await getMany('SELECT id, name, slug, stock_status, is_bestseller FROM products');
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

main();
