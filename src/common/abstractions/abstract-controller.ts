import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { QueryParams } from '../dto';
import { AbstractService } from './abstract-service';
import { IController } from './i-controller.interface';

export abstract class AbstractController<
  Entity extends { id: string | number },
  Dto,
  CreateDto = Dto,
  UpdateDto = Partial<CreateDto>,
> implements IController<Dto, CreateDto, UpdateDto> {
  protected constructor(
    protected readonly service: AbstractService<Entity, Dto, CreateDto, UpdateDto>,
  ) {}

  getAll(queryParams?: QueryParams): Observable<Dto[]> {
    return this.service.findAll(queryParams).pipe(map((result) => result.data));
  }

  getById(id: string | number): Observable<Dto> {
    return this.service.findOne(id);
  }

  create(createDto: CreateDto): Observable<Dto> {
    return this.service.create(createDto);
  }

  update(id: string | number, updateDto: UpdateDto): Observable<Dto> {
    return this.service.update(id, updateDto);
  }

  delete(id: string | number): Observable<void> {
    return this.service.remove(id);
  }
}
