import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialEntity } from './raw-material.entity';
import { RawMaterialService } from './raw-material.service';
import { RawMaterialController } from './raw-material.controlleur';
import { RawMaterialMapper } from './raw-material.mapper';
import { ReferentialMapper } from '../common/referential.mapper';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterialEntity]), CategoryModule],
  controllers: [RawMaterialController],
  providers: [RawMaterialService, RawMaterialMapper, ReferentialMapper],
  exports: [RawMaterialService],
})
export class RawMaterialModule {}
