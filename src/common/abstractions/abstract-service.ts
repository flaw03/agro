import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { Observable, from, map, switchMap, throwError } from 'rxjs';

import { AbstractFilter } from './abstract-filter';
import { AbstractMapper } from './abstract.mapper';
import { QueryParams } from '../dto/query-params';
import { SortOrder } from '../dto/sort-order';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class AbstractService<
  Entity extends { id: string | number },
  Dto,
  CreateDto = Omit<Dto, 'id'>,
  UpdateDto = Partial<CreateDto>,
> {
  protected constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly mapper: AbstractMapper<Entity, Dto, CreateDto>,
  ) {}

  create(createDto: CreateDto): Observable<Dto> {
    return from(this.repository.save(this.mapper.toEntity(createDto) as DeepPartial<Entity>)).pipe(
      map((entity) => this.mapper.toDto(entity)),
    );
  }

  findAll(
    queryParams?: QueryParams,
    filter?: AbstractFilter<Entity>,
  ): Observable<PaginatedResult<Dto>> {
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 10;
    const skip = (page - 1) * limit;

    let queryBuilder = this.repository.createQueryBuilder('entity');

    if (filter) {
      queryBuilder = filter.apply(queryBuilder);
    }

    if (queryParams?.sortBy) {
      const order = queryParams.sortOrder === SortOrder.DESC ? SortOrder.DESC : SortOrder.ASC;
      queryBuilder.orderBy(`entity.${queryParams.sortBy}`, order);
    }

    return from(queryBuilder.skip(skip).take(limit).getManyAndCount()).pipe(
      map(([data, total]) => ({
        data: this.mapper.toDtoList(data),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })),
    );
  }

  findOne(id: string | number): Observable<Dto> {
    return from(this.repository.findOne({ where: { id } as FindOptionsWhere<Entity> })).pipe(
      map((entity) => {
        if (!entity) {
          throw new Error(`Entity with id ${id} not found`);
        }
        return this.mapper.toDto(entity);
      }),
    );
  }

  update(id: string | number, updateDto: UpdateDto): Observable<Dto> {
    return from(this.repository.findOne({ where: { id } as FindOptionsWhere<Entity> })).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(() => new Error(`Entity with id ${id} not found`));
        }
        const updatedEntity = Object.assign(entity, updateDto);
        return from(this.repository.save(updatedEntity));
      }),
      map((entity) => this.mapper.toDto(entity)),
    );
  }

  remove(id: string | number): Observable<void> {
    return from(this.repository.findOne({ where: { id } as FindOptionsWhere<Entity> })).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(() => new Error(`Entity with id ${id} not found`));
        }
        return from(this.repository.remove(entity));
      }),
      map(() => undefined),
    );
  }

  protected getQueryBuilder() {
    return this.repository.createQueryBuilder('entity');
  }

  protected createFilter(): AbstractFilter<Entity> {
    return new (class extends AbstractFilter<Entity> {})();
  }
}
