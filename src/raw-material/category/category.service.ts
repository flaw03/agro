import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractReferentialService } from '../../common/abstractions/abstract-referential.service';
import { CategoryEntity } from './category.entity';
import { ReferentialMapper } from '../../common/referential.mapper';
import type { Category } from '../../common/dto/category';

@Injectable()
export class CategoryService extends AbstractReferentialService<CategoryEntity, Category> {
  constructor(
    @InjectRepository(CategoryEntity)
    protected readonly repository: Repository<CategoryEntity>,
    protected readonly mapper: ReferentialMapper<CategoryEntity, Category>,
  ) {
    super(repository, mapper);
  }
}
