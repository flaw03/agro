import { Observable } from 'rxjs';
import { AbstractController } from './abstract-controller';
import type { AbstractReferentialService } from './abstract-referential.service';
import { ReferentialEntity } from './referential.entity.interface';
import { Referential } from '../dto/referential';

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

  getAllActive(): Observable<Dto[]> {
    return this.referentialService.findAllActive();
  }

  getAllReferentials(activeOnly: boolean = false): Observable<Dto[]> {
    return this.referentialService.findAllReferentials(activeOnly);
  }

  getByCode(code: string): Observable<Dto | null> {
    return this.referentialService.findByCode(code);
  }

  activateReferential(id: string | number): Observable<Dto> {
    return this.referentialService.activate(id);
  }

  deactivateReferential(id: string | number): Observable<Dto> {
    return this.referentialService.deactivate(id);
  }
}
