import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../raw-material/category/category.entity';
import { RawMaterialEntity } from '../raw-material/raw-material.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, RawMaterialEntity])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
