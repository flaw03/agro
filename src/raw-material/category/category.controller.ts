import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AbstractReferentialController } from '../../common/abstractions/abstract-referential.controller';
import type { Category } from '../../common/dto/category';
import type { Referential } from '../../common/dto/referential';
import { CategoryEntity } from './category.entity';

type CreateCategory = Omit<Referential, 'id'>;
type UpdateCategory = Partial<CreateCategory>;
import { CategoryService } from './category.service';
import { Endpoint } from '../../endpoint';

@Controller(Endpoint.CATEGORIES)
export class CategoryController extends AbstractReferentialController<CategoryEntity, Category> {
  constructor(protected readonly categoryService: CategoryService) {
    super(categoryService);
  }

  @Get()
  getAllCategories(): Observable<Category[]> {
    return this.getAll();
  }

  @Get(':code')
  getOne(@Param('code') code: string): Observable<Category> {
    return this.getByCode(code);
  }

  @Post()
  createCategory(@Body() createDto: CreateCategory): Observable<Category> {
    return this.create(createDto);
  }

  @Put(':code')
  updateCategory(@Param('id') id: number, @Body() updateDto: UpdateCategory): Observable<Category> {
    return this.update(id, updateDto);
  }

  @Delete(':code')
  deleteCategory(@Param('id') id: number): Observable<void> {
    return this.delete(id);
  }
}
