export abstract class AbstractMapper<Entity, Dto, CreateDto = Dto> {
  toDtoList(entities: Entity[]): Dto[] {
    return entities.map((e) => this.toDto(e));
  }

  toEntityList(dtos: CreateDto[]): Entity[] {
    return dtos.map((d) => this.toEntity(d));
  }

  abstract toDto(entity: Entity): Dto;

  abstract toEntity(dto: CreateDto): Entity;
}
