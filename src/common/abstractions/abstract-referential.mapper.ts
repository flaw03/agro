import { AbstractMapper } from './abstract.mapper';
import { ReferentialEntity } from './referential.entity.interface';
import { Referential } from '../dto/referential';

export abstract class AbstractReferentialMapper<
  Entity extends ReferentialEntity,
  Dto extends Referential,
  CreateDto = Dto,
> extends AbstractMapper<Entity, Dto, CreateDto> {
  toDto(entity: Entity): Dto {
    return {
      id: entity.id as number,
      code: entity.code,
      label: entity.label,
      isActive: entity.isActive ?? true,
      ...this.mapAdditionalFieldsToDto(entity),
    } as Dto;
  }

  toEntity(dto: CreateDto): Entity {
    const baseEntity = {
      code: (dto as any).code,
      label: (dto as any).label,
      isActive: (dto as any).isActive ?? true,
      ...this.mapAdditionalFieldsToEntity(dto),
    };

    if ((dto as any).id) {
      (baseEntity as any).id = (dto as any).id;
    }

    return baseEntity as Entity;
  }

  protected mapAdditionalFieldsToDto(_entity: Entity): Partial<Dto> {
    return {};
  }

  protected mapAdditionalFieldsToEntity(_dto: CreateDto): Partial<Entity> {
    return {};
  }
}
