import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AbstractController } from '../common/abstractions/abstract-controller';
import type { QueryParams } from '../common/dto/query-params';
import type { RawMaterial } from '../common/dto/raw-material';
import type { StockMovement } from '../common/dto/stock-movement';

type CreateRawMaterial = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt' | 'stockActuel'>;
type UpdateRawMaterial = Partial<CreateRawMaterial>;
import { Endpoint } from '../endpoint';
import { RawMaterialEntity } from './raw-material.entity';
import { RawMaterialService } from './raw-material.service';

@Controller(Endpoint.RAW_MATERIALS)
export class RawMaterialController extends AbstractController<
  RawMaterialEntity,
  RawMaterial,
  CreateRawMaterial,
  UpdateRawMaterial
> {
  constructor(protected readonly rawMaterialService: RawMaterialService) {
    super(rawMaterialService);
  }

  @Get()
  getAllRawMaterials(@Query() queryParams?: QueryParams): Observable<RawMaterial[]> {
    return this.getAll(queryParams);
  }

  @Get(':id')
  getRawMaterial(@Param('id', ParseUUIDPipe) id: string): Observable<RawMaterial> {
    return this.getById(id);
  }

  @Post()
  createRawMaterial(@Body() createDto: CreateRawMaterial): Observable<RawMaterial> {
    return this.create(createDto);
  }

  @Put(':id')
  updateRawMaterial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRawMaterial,
  ): Observable<RawMaterial> {
    return this.update(id, updateDto);
  }

  @Put(':id/stock')
  updateStockMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() movement: StockMovement,
  ): Observable<RawMaterial> {
    return this.rawMaterialService.updateStock(id, movement);
  }

  @Delete(':id')
  deleteRawMaterial(@Param('id', ParseUUIDPipe) id: string): Observable<void> {
    return this.delete(id);
  }
}
