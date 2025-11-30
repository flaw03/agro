import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import { AbstractService } from '../common/abstractions/abstract-service';
import type { RawMaterial } from '../common/dto/raw-material';
import type { StockMovement } from '../common/dto/stock-movement';
import { StockMovementType } from '../common/dto/stock-movement';
import { RawMaterialEntity } from './raw-material.entity';
import { RawMaterialMapper } from './raw-material.mapper';

@Injectable()
export class RawMaterialService extends AbstractService<RawMaterialEntity, RawMaterial> {
  constructor(
    @InjectRepository(RawMaterialEntity)
    protected readonly repository: Repository<RawMaterialEntity>,
    protected readonly mapper: RawMaterialMapper,
  ) {
    super(repository, mapper);
  }

  updateStock(id: string, movement: StockMovement): Observable<RawMaterial> {
    return from(this.repository.findOne({ where: { id } })).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(() => new Error(`Raw material with id ${id} not found`));
        }

        const currentStock = Number(entity.stockActuel);
        let newStock: number;

        if (movement.type === StockMovementType.ENTREE) {
          newStock = currentStock + movement.quantite;
        } else if (movement.type === StockMovementType.SORTIE) {
          newStock = currentStock - movement.quantite;

          if (newStock < 0) {
            return throwError(
              () =>
                new Error(
                  `Insufficient stock. Current: ${currentStock}, Requested: ${movement.quantite}`,
                ),
            );
          }
        } else {
          return throwError(() => new Error(`Invalid movement type: ${movement.type}`));
        }

        entity.stockActuel = newStock;
        return from(this.repository.save(entity));
      }),
      map((entity) => this.mapper.toDto(entity)),
    );
  }

  findByCategory(categoryId: number): Observable<RawMaterial[]> {
    return from(
      this.repository.find({
        where: { categorie: { id: categoryId } },
        relations: ['categorie'],
      }),
    ).pipe(map((entities) => this.mapper.toDtoList(entities)));
  }
}
