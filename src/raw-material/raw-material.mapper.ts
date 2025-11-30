import { AbstractMapper } from '../common/abstractions/abstract.mapper';
import { RawMaterialEntity } from './raw-material.entity';
import { ReferentialMapper } from '../common/referential.mapper';
import { RawMaterial } from '../common/dto/raw-material';
import { Category } from '../common/dto/category';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RawMaterialMapper extends AbstractMapper<RawMaterialEntity, RawMaterial> {
  private readonly referentialMapper: ReferentialMapper;

  constructor(referentialMapper: ReferentialMapper) {
    super();
    this.referentialMapper = referentialMapper;
  }

  toDto(entity: RawMaterialEntity): RawMaterial {
    return {
      id: entity.id,
      nom: entity.nom,
      categorie: this.referentialMapper.toDto(entity.categorie) as Category,
      fournisseur: entity.fournisseur,
      prix: Number(entity.prix),
      isActive: entity.isActive,
      stockInitial: Number(entity.stockInitial),
      stockActuel: Number(entity.stockActuel),
      unite: entity.unite,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toEntity(dto: RawMaterial): RawMaterialEntity {
    const entity = new RawMaterialEntity();
    entity.nom = dto.nom;
    entity.categorieId = dto.categorie.id!;
    entity.fournisseur = dto.fournisseur;
    entity.prix = dto.prix;
    entity.stockInitial = dto.stockInitial;
    entity.stockActuel = dto.stockInitial;
    entity.unite = dto.unite;
    return entity;
  }
}
