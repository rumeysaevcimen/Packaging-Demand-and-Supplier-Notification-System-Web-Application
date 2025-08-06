import { Controller, Get, Post, Patch, Body, Query } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Controller('requests')
export class RequestController {
  private dataPath = join(process.cwd(), 'src', 'data', 'requests.json');

  private getAllRequests() {
    const data = readFileSync(this.dataPath, 'utf8');
    return JSON.parse(data);
  }

  @Get()
  getAll(@Query('productTypeIds') productTypeIds?: string) {
    let requests = this.getAllRequests();

    if (productTypeIds) {
      const ids = productTypeIds.split(',').map(id => Number(id));
      requests = requests.filter((req) =>
        req.products.some((p) => ids.includes(p.productTypeId))
      );
    }

    return requests;
  }

@Post()
add(@Body() body: { customerId: number; products: { productTypeId: number; quantity: number }[] }) {
  const requests = this.getAllRequests();

  const newId = requests.length ? requests[requests.length - 1].id + 1 : 1;
  const newRequest = {
    id: newId,
    customerId: body.customerId,
    products: body.products,
    interestedSupplierIds: [],
    createdAt: new Date().toISOString(), 
  };

  requests.push(newRequest);
  writeFileSync(this.dataPath, JSON.stringify(requests, null, 2), 'utf8');

  return newRequest;
}

  @Patch('interest')
  updateInterest(@Body() body: { requestId: number; supplierId: number; interested: boolean }) {
    const requests = this.getAllRequests();

    const reqIndex = requests.findIndex(r => r.id === body.requestId);
    if (reqIndex === -1) {
      return { success: false, message: 'Talep bulunamadı' };
    }

    const interestedSuppliers = requests[reqIndex].interestedSupplierIds;

    if (body.interested) {
      if (!interestedSuppliers.includes(body.supplierId)) {
        interestedSuppliers.push(body.supplierId);
      }
    } else {
      const idx = interestedSuppliers.indexOf(body.supplierId);
      if (idx !== -1) {
        interestedSuppliers.splice(idx, 1);
      }
    }

    requests[reqIndex].interestedSupplierIds = interestedSuppliers;
    writeFileSync(this.dataPath, JSON.stringify(requests, null, 2), 'utf8');

    return { success: true, updatedRequest: requests[reqIndex] };
  }
}
