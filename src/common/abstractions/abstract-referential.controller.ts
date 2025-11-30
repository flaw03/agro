import { Observable } from 'rxjs';
import { AbstractController } from './abstract-controller';
import type { AbstractReferentialService } from './abstract-referential.service';
import { ReferentialEntity } from './referential.entity.interface';
import { Referential } from '../dto/referential';
import { QueryParams } from '../dto/query-params';

export abstract class AbstractReferentialController<
  Entity extends ReferentialEntity,
  Dto extends Referential,
  CreateDto = Dto,
  UpdateDto = Partial<CreateDto>,
> extends AbstractController<Entity, Dto, CreateDto, UpdateDto> {
  protected constructor(
    protected readonly referentialService: AbstractReferentialService<
      Entity,
      Dto,
      CreateDto,
      UpdateDto
    >,
  ) {
    super(referentialService);
  }

  override getAll(queryParams?: QueryParams): Observable<Dto[]> {
    return this.referentialService.findAllReferentials();
  }

  getByCode(code: string): Observable<Dto> {
    return this.referentialService.findByCode(code);
  }
}
