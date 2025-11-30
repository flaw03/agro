import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReferentialEntity } from '../../common/abstractions/referential.entity.interface';

@Entity('categories')
export class CategoryEntity implements ReferentialEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;
}
