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
    mapper: ReferentialMapper,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(repository, mapper as any);
  }
}
