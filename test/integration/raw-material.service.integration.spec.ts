import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialService } from '../../src/raw-material/raw-material.service';
import { RawMaterialEntity } from '../../src/raw-material/raw-material.entity';
import { RawMaterialMapper } from '../../src/raw-material/raw-material.mapper';
import { CategoryEntity } from '../../src/raw-material/category/category.entity';
import { firstValueFrom } from 'rxjs';
import { QueryParams, SortOrder } from '../index';

describe('RawMaterialService (Integration)', () => {
  let service: RawMaterialService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [RawMaterialEntity, CategoryEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([RawMaterialEntity, CategoryEntity]),
      ],
      providers: [RawMaterialService, RawMaterialMapper],
    }).compile();

    service = module.get<RawMaterialService>(RawMaterialService);

    // Seed categories
    const categoryRepo = module.get('CategoryEntityRepository');
    await categoryRepo.save([
      { code: 'FRUITS', label: 'Fruits' },
      { code: 'LEGUMES', label: 'Légumes' },
    ]);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    const repo = module.get('RawMaterialEntityRepository');
    await repo.clear();
  });

  describe('create', () => {
    it('should create a raw material', async () => {
      const createDto = {
        nom: 'Tomate',
        fournisseur: 'Ferme Bio',
        prix: 2.5,
        stockInitial: 1000,
        stockActuel: 1000,
        unite: 'kg',
        categorie: {
          id: 2,
          code: 'LEGUMES',
          label: 'Légumes',
        },
      };

      const result = await firstValueFrom(service.create(createDto));

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.nom).toBe('Tomate');
      expect(result.prix).toBe(2.5);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      const repo = module.get('RawMaterialEntityRepository');
      await repo.save([
        {
          nom: 'Tomate',
          fournisseur: 'Ferme A',
          prix: 2.5,
          stockInitial: 100,
          stockActuel: 100,
          unite: 'kg',
          categorie: 'LEGUMES',
        },
        {
          nom: 'Pomme',
          fournisseur: 'Ferme B',
          prix: 1.5,
          stockInitial: 200,
          stockActuel: 200,
          unite: 'kg',
          categorie: 'FRUITS',
        },
        {
          nom: 'Carotte',
          fournisseur: 'Ferme C',
          prix: 1.0,
          stockInitial: 150,
          stockActuel: 150,
          unite: 'kg',
          categorie: 'LEGUMES',
        },
      ]);
    });

    it('should return paginated results with default params', async () => {
      const result = await firstValueFrom(service.findAll());

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should support pagination', async () => {
      const queryParams: QueryParams = {
        page: 1,
        limit: 2,
      };

      const result = await firstValueFrom(service.findAll(queryParams));

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    it('should support sorting by name ascending', async () => {
      const queryParams: QueryParams = {
        sortBy: 'nom',
        sortOrder: SortOrder.ASC,
      };

      const result = await firstValueFrom(service.findAll(queryParams));

      expect(result.data[0].nom).toBe('Carotte');
      expect(result.data[1].nom).toBe('Pomme');
      expect(result.data[2].nom).toBe('Tomate');
    });

    it('should support sorting by price descending', async () => {
      const queryParams: QueryParams = {
        sortBy: 'prix',
        sortOrder: SortOrder.DESC,
      };

      const result = await firstValueFrom(service.findAll(queryParams));

      expect(result.data[0].prix).toBe(2.5);
      expect(result.data[2].prix).toBe(1.0);
    });
  });

  describe('findOne', () => {
    let materialId: number;

    beforeEach(async () => {
      const repo = module.get('RawMaterialEntityRepository');
      const saved = await repo.save({
        nom: 'Tomate',
        fournisseur: 'Ferme',
        prix: 2.5,
        stockInitial: 100,
        stockActuel: 100,
        unite: 'kg',
        categorie: 'LEGUMES',
      });
      materialId = saved.id;
    });

    it('should return a raw material by id', async () => {
      const result = await firstValueFrom(service.findOne(materialId));

      expect(result).toBeDefined();
      expect(result.id).toBe(materialId);
      expect(result.nom).toBe('Tomate');
    });

    it('should throw error for non-existent id', async () => {
      await expect(firstValueFrom(service.findOne(99999))).rejects.toThrow();
    });
  });

  describe('update', () => {
    let materialId: number;

    beforeEach(async () => {
      const repo = module.get('RawMaterialEntityRepository');
      const saved = await repo.save({
        nom: 'Tomate',
        fournisseur: 'Ferme',
        prix: 2.5,
        stockInitial: 100,
        stockActuel: 100,
        unite: 'kg',
        categorie: 'LEGUMES',
      });
      materialId = saved.id;
    });

    it('should update a raw material', async () => {
      const updateDto = {
        nom: 'Tomate Bio',
        prix: 3.5,
      };

      const result = await firstValueFrom(service.update(materialId, updateDto));

      expect(result.nom).toBe('Tomate Bio');
      expect(result.prix).toBe(3.5);
    });
  });

  describe('remove', () => {
    let materialId: number;

    beforeEach(async () => {
      const repo = module.get('RawMaterialEntityRepository');
      const saved = await repo.save({
        nom: 'Tomate',
        fournisseur: 'Ferme',
        prix: 2.5,
        stockInitial: 100,
        stockActuel: 100,
        unite: 'kg',
        categorie: 'LEGUMES',
      });
      materialId = saved.id;
    });

    it('should delete a raw material', async () => {
      await firstValueFrom(service.remove(materialId));

      await expect(firstValueFrom(service.findOne(materialId))).rejects.toThrow();
    });
  });
});
