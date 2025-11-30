import { AbstractMapper } from '../../test-helpers';

// Classes de test pour simuler Entity et DTO
class TestEntity {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

interface TestDto {
  id: number;
  name: string;
  displayName?: string;
}

// Implémentation concrète pour les tests
class TestMapper extends AbstractMapper<TestEntity, TestDto> {
  toDto(entity: TestEntity): TestDto {
    return {
      id: entity.id,
      name: entity.name,
      displayName: `Entity: ${entity.name}`,
    };
  }

  toEntity(dto: TestDto): TestEntity {
    return new TestEntity(dto.id, dto.name);
  }
}

describe('AbstractMapper', () => {
  let mapper: TestMapper;

  beforeEach(() => {
    mapper = new TestMapper();
  });

  describe('toDto', () => {
    it('should convert entity to DTO', () => {
      const entity = new TestEntity(1, 'Test');

      const result = mapper.toDto(entity);

      expect(result).toEqual({
        id: 1,
        name: 'Test',
        displayName: 'Entity: Test',
      });
    });
  });

  describe('toEntity', () => {
    it('should convert DTO to entity', () => {
      const dto: TestDto = {
        id: 2,
        name: 'Test Entity',
      };

      const result = mapper.toEntity(dto);

      expect(result).toBeInstanceOf(TestEntity);
      expect(result.id).toBe(2);
      expect(result.name).toBe('Test Entity');
    });
  });

  describe('toDtoList', () => {
    it('should convert array of entities to array of DTOs', () => {
      const entities = [
        new TestEntity(1, 'First'),
        new TestEntity(2, 'Second'),
        new TestEntity(3, 'Third'),
      ];

      const result = mapper.toDtoList(entities);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        name: 'First',
        displayName: 'Entity: First',
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Second',
        displayName: 'Entity: Second',
      });
      expect(result[2]).toEqual({
        id: 3,
        name: 'Third',
        displayName: 'Entity: Third',
      });
    });

    it('should return empty array when given empty array', () => {
      const result = mapper.toDtoList([]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toEntityList', () => {
    it('should convert array of DTOs to array of entities', () => {
      const dtos: TestDto[] = [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
        { id: 3, name: 'Third' },
      ];

      const result = mapper.toEntityList(dtos);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(TestEntity);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('First');
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should return empty array when given empty array', () => {
      const result = mapper.toEntityList([]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
