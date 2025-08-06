import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class RequestsService {
  private dataPath = path.join(__dirname, '..', 'data', 'requests.json');

  async findAll() {
    const data = await fs.readFile(this.dataPath, 'utf-8');
    return JSON.parse(data);
  }

  async create(request: any) {
    const requests = await this.findAll();
    const newId = requests.length ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    const newRequest = { id: newId, ...request, interestedSupplierIds: [] };
    requests.push(newRequest);
    await fs.writeFile(this.dataPath, JSON.stringify(requests, null, 2), 'utf-8');
    return newRequest;
  }
}
