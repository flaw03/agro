import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AbstractMapper,
  AbstractService,
  PaginatedResult,
  QueryParams,
  SortOrder,
} from '../../test-helpers';
import { firstValueFrom } from 'rxjs';

// Entité de test
class TestEntity {
  id: number;
  name: string;
  status: string;
}

// DTO de test
interface TestDto {
  id: number;
  name: string;
  status: string;
}

// Mapper de test
class TestMapper extends AbstractMapper<TestEntity, TestDto> {
  toDto(entity: TestEntity): TestDto {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
    };
  }

  toEntity(dto: TestDto): TestEntity {
    const entity = new TestEntity();
    entity.id = dto.id;
    entity.name = dto.name;
    entity.status = dto.status;
    return entity;
  }
}

// Service de test concret
class TestService extends AbstractService<TestEntity, TestDto> {
  constructor(repository: Repository<TestEntity>, mapper: TestMapper) {
    super(repository, mapper);
  }
}

describe('AbstractService', () => {
  let service: TestService;
  let repository: jest.Mocked<Repository<TestEntity>>;
  let mapper: TestMapper;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<TestEntity>>;

  beforeEach(() => {
    // Mock du QueryBuilder
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    } as any;

    // Mock du Repository
    repository = {
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    } as any;

    mapper = new TestMapper();
    service = new TestService(repository, mapper);
  });

  describe('create', () => {
    it('should create and return a DTO', async () => {
      const createDto: TestDto = {
        id: 1,
        name: 'Test',
        status: 'active',
      };

      const savedEntity: TestEntity = {
        id: 1,
        name: 'Test',
        status: 'active',
      };

      repository.save.mockResolvedValue(savedEntity);

      const result = await firstValueFrom(service.create(createDto));

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
      expect(result).toEqual({
        id: 1,
        name: 'Test',
        status: 'active',
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results with default pagination', async () => {
      const entities: TestEntity[] = [
        { id: 1, name: 'First', status: 'active' },
        { id: 2, name: 'Second', status: 'active' },
      ];

      queryBuilder.getManyAndCount.mockResolvedValue([entities, 2]);

      const result = await firstValueFrom(service.findAll());

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [
          { id: 1, name: 'First', status: 'active' },
          { id: 2, name: 'Second', status: 'active' },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply pagination parameters', async () => {
      const queryParams: QueryParams = {
        page: 2,
        limit: 5,
      };

      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await firstValueFrom(service.findAll(queryParams));

      expect(queryBuilder.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * limit 5
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should apply sorting', async () => {
      const queryParams: QueryParams = {
        sortBy: 'name',
        sortOrder: SortOrder.DESC,
      };

      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await firstValueFrom(service.findAll(queryParams));

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('entity.name', SortOrder.DESC);
    });

    it('should calculate total pages correctly', async () => {
      const queryParams: QueryParams = {
        page: 1,
        limit: 3,
      };

      queryBuilder.getManyAndCount.mockResolvedValue([[], 10]);

      const result = await firstValueFrom(service.findAll(queryParams));

      expect(result.totalPages).toBe(4); // Math.ceil(10 / 3)
    });
  });

  describe('findOne', () => {
    it('should return a DTO when entity is found', async () => {
      const entity: TestEntity = {
        id: 1,
        name: 'Test',
        status: 'active',
      };

      repository.findOne.mockResolvedValue(entity);

      const result = await firstValueFrom(service.findOne(1));

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        id: 1,
        name: 'Test',
        status: 'active',
      });
    });

    it('should throw error when entity is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(firstValueFrom(service.findOne(999))).rejects.toThrow(
        'Entity with id 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated DTO', async () => {
      const updateDto = { name: 'Updated' };
      const existingEntity: TestEntity = {
        id: 1,
        name: 'Original',
        status: 'active',
      };
      const updatedEntity: TestEntity = {
        id: 1,
        name: 'Updated',
        status: 'active',
      };

      repository.findOne.mockResolvedValueOnce(existingEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await firstValueFrom(service.update(1, updateDto));

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        name: 'Updated',
        status: 'active',
      });
    });

    it('should throw error when entity to update is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(firstValueFrom(service.update(999, { name: 'Test' }))).rejects.toThrow(
        'Entity with id 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete entity successfully', async () => {
      const entity: TestEntity = {
        id: 1,
        name: 'Test',
        status: 'active',
      };

      repository.findOne.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(entity);

      await firstValueFrom(service.remove(1));

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(entity);
    });

    it('should throw error when entity to delete is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(firstValueFrom(service.remove(999))).rejects.toThrow(
        'Entity with id 999 not found',
      );
    });
  });
});
