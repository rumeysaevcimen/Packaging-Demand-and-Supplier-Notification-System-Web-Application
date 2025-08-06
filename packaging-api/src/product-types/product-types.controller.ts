import { Controller, Get, Post, Body } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ProductType {
  id: number;
  name: string;
}

@Controller('product-types')
export class ProductTypeController {
  // JSON dosyasının mutlak yolu
  private dataPath = join(process.cwd(), 'src', 'data', 'productTypes.json');

  @Get()
  getAll(): ProductType[] {
    try {
      const data = readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Ürün tipleri okunurken hata:', error);
      return [];
    }
  }

  @Post()
  add(@Body() body: { name: string }): ProductType | { error: string } {
    try {
      const data = readFileSync(this.dataPath, 'utf8');
      const productTypes: ProductType[] = JSON.parse(data);

      // Yeni id, mevcut son id + 1 veya 1
      const newId = productTypes.length ? productTypes[productTypes.length - 1].id + 1 : 1;

      const newProductType: ProductType = {
        id: newId,
        name: body.name,
      };

      productTypes.push(newProductType);

      // Dosyaya tekrar yaz
      writeFileSync(this.dataPath, JSON.stringify(productTypes, null, 2), 'utf8');

      return newProductType;
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      return { error: 'Ürün eklenirken hata oluştu' };
    }
  }
}
