import { Observable } from 'rxjs';
import type { QueryParams } from '../dto';

export interface IController<Dto, CreateDto = Dto, UpdateDto = Partial<CreateDto>> {
  getAll(queryParams?: QueryParams): Observable<Dto[]>;

  getById(id: string | number): Observable<Dto>;

  create(createDto: CreateDto): Observable<Dto>;

  update(id: string | number, updateDto: UpdateDto): Observable<Dto>;

  delete(id: string | number): Observable<void>;
}
