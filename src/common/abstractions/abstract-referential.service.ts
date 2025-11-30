import { Observable, from, map } from 'rxjs';
import { Repository } from 'typeorm';
import { AbstractService } from './abstract-service';
import { ReferentialEntity } from './referential.entity.interface';
import { Referential } from '../dto/referential';
import { SortOrder } from '../dto/sort-order';
import { AbstractReferentialMapper } from './abstract-referential.mapper';

export abstract class AbstractReferentialService<
  Entity extends ReferentialEntity,
  Dto extends Referential,
  CreateDto = Dto,
  UpdateDto = Partial<CreateDto>,
> extends AbstractService<Entity, Dto, CreateDto, UpdateDto> {
  protected constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly mapper: AbstractReferentialMapper<Entity, Dto, CreateDto>,
  ) {
    super(repository, mapper);
  }

  findAllReferentials(): Observable<Dto[]> {
    let queryBuilder = this.repository.createQueryBuilder('entity');
    queryBuilder = queryBuilder.orderBy('entity.label', SortOrder.ASC);
    return this.executeQuery(queryBuilder);
  }

  findByCode(code: string): Observable<Dto> {
    return this.executeQueryForSingle(
      this.repository.createQueryBuilder('entity').where('entity.code = :code', { code }),
    );
  }

  private executeQuery(queryBuilder: any): Observable<Dto[]> {
    return from(queryBuilder.getMany()).pipe(
      map((entities: Entity[]) => this.mapper.toDtoList(entities)),
    );
  }

  private executeQueryForSingle(queryBuilder: any): Observable<Dto> {
    return from(queryBuilder.getOne()).pipe(
      map((entity: Entity) => (entity ? this.mapper.toDto(entity) : null)),
    );
  }
}
