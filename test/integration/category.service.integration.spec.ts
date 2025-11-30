import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from '../../src/raw-material/category/category.service';
import { CategoryEntity } from '../../src/raw-material/category/category.entity';
import { firstValueFrom } from 'rxjs';
import { ReferentialMapper } from '../../src/common/referential.mapper';

describe('CategoryService (Integration)', () => {
  let service: CategoryService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [CategoryEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([CategoryEntity]),
      ],
      providers: [CategoryService, ReferentialMapper],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('getAllReferentials', () => {
    it('should return empty array when no categories', async () => {
      const result = await firstValueFrom(service.findAllReferentials());

      expect(result).toEqual([]);
    });

    it('should return all categories after creation', async () => {
      // Create categories via repository
      const repo = module.get('CategoryEntityRepository');
      await repo.save([
        { code: 'FRUITS', label: 'Fruits' },
        { code: 'LEGUMES', label: 'Légumes' },
      ]);

      const result = await firstValueFrom(service.findAllReferentials());

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('label');
    });
  });

  describe('getByCode', () => {
    beforeEach(async () => {
      const repo = module.get('CategoryEntityRepository');
      await repo.clear();
      await repo.save({ code: 'FRUITS', label: 'Fruits' });
    });

    it('should return category by code', async () => {
      const result = await firstValueFrom(service.findByCode('FRUITS'));

      expect(result).toBeDefined();
      expect(result.code).toBe('FRUITS');
      expect(result.label).toBe('Fruits');
    });

    it('should be return null  for non-existent code', async () => {
      const result = await firstValueFrom(service.findByCode('NON_EXISTENT'));
      expect(result).toBeNull();
    });

    it('the code is null should return null', async () => {
      const result = await firstValueFrom(service.findByCode(null));
      expect(result).toBeNull();
    });

    it('the code is empty should return null', async () => {
      const result = await firstValueFrom(service.findByCode(''));
      expect(result).toBeNull();
    });
  });
});
