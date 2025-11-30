import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category/category.entity';

@Entity('raw_materials')
export class RawMaterialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @ManyToOne(() => CategoryEntity, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'categorie_id' })
  categorie: CategoryEntity;

  @Column({ type: 'int', name: 'categorie_id' })
  categorieId: number;

  @Column({ type: 'varchar', length: 255 })
  fournisseur: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'stock_initial' })
  stockInitial: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'stock_actuel',
    default: 0,
  })
  stockActuel: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unite: string | null; // kg, L, units, etc.

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
