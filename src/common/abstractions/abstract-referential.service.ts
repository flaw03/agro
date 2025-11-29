import { Observable, from, map } from 'rxjs';
import { Repository } from 'typeorm';
import { AbstractMapper } from './abstract.mapper';
import { AbstractService } from './abstract-service';
import { ReferentialEntity } from './referential.entity.interface';
import { SortOrder } from './sort-order.enum';
import { Referential } from '../dto/referential';

export abstract class AbstractReferentialService<
  Entity extends ReferentialEntity,
  Dto extends Referential,
  CreateDto = Dto,
  UpdateDto = Partial<CreateDto>,
> extends AbstractService<Entity, Dto, CreateDto, UpdateDto> {
  protected constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly mapper: AbstractMapper<Entity, Dto, CreateDto>,
  ) {
    super(repository, mapper);
  }

  findAllActive(): Observable<Dto[]> {
    return this.findAllReferentials(true);
  }

  findAllReferentials(activeOnly: boolean = false): Observable<Dto[]> {
    let queryBuilder = this.repository.createQueryBuilder('entity');

    if (activeOnly) {
      queryBuilder = queryBuilder.where('entity.isActive = :isActive', { isActive: true });
    }

    queryBuilder = queryBuilder.orderBy('entity.label', SortOrder.ASC);

    return this.executeQuery(queryBuilder);
  }

  findByCode(code: string): Observable<Dto | null> {
    return this.executeQueryForSingle(
      this.repository.createQueryBuilder('entity').where('entity.code = :code', { code }),
    );
  }

  activate(id: string | number): Observable<Dto> {
    return this.toggleActive(id, true);
  }

  deactivate(id: string | number): Observable<Dto> {
    return this.toggleActive(id, false);
  }

  private toggleActive(id: string | number, isActive: boolean): Observable<Dto> {
    return this.update(id, { isActive } as UpdateDto);
  }

  private executeQuery(queryBuilder: any): Observable<Dto[]> {
    return from(queryBuilder.getMany()).pipe(
      map((entities: Entity[]) => this.mapper.toDtoList(entities)),
    );
  }

  private executeQueryForSingle(queryBuilder: any): Observable<Dto | null> {
    return from(queryBuilder.getOne()).pipe(
      map((entity: Entity | null) => (entity ? this.mapper.toDto(entity) : null)),
    );
  }
}
