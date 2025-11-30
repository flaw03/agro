import { AbstractMapper } from '../common/abstractions/abstract.mapper';
import { RawMaterialEntity } from './raw-material.entity';
import { ReferentialMapper } from '../common/referential.mapper';
import { RawMaterial } from '../common/dto/raw-material';
import { Injectable } from '@nestjs/common';
import { Referential } from '../common/dto/referential';
import { ReferentialEntity } from '../common/abstractions/referential.entity.interface';

@Injectable()
export class RawMaterialMapper extends AbstractMapper<RawMaterialEntity, RawMaterial> {
  private readonly referentialMapper: ReferentialMapper<ReferentialEntity, Referential>;

  constructor(referentialMapper: ReferentialMapper<ReferentialEntity, Referential>) {
    super();
    this.referentialMapper = referentialMapper;
  }

  toDto(entity: RawMaterialEntity): RawMaterial {
    return {
      id: entity.id,
      nom: entity.nom,
      categorie: this.referentialMapper.toDto(entity.categorie),
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
