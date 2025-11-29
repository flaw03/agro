import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { FilterOperator } from './filter-operator.enum';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export abstract class AbstractFilter<Entity extends ObjectLiteral> {
  protected conditions: FilterCondition[] = [];

  where(field: string, operator: FilterOperator, value: any): this {
    this.conditions.push({ field, operator, value });
    return this;
  }

  equals(field: string, value: any): this {
    return this.where(field, FilterOperator.EQUALS, value);
  }

  notEquals(field: string, value: any): this {
    return this.where(field, FilterOperator.NOT_EQUALS, value);
  }

  greaterThan(field: string, value: any): this {
    return this.where(field, FilterOperator.GREATER_THAN, value);
  }

  greaterThanOrEqual(field: string, value: any): this {
    return this.where(field, FilterOperator.GREATER_THAN_OR_EQUAL, value);
  }

  lessThan(field: string, value: any): this {
    return this.where(field, FilterOperator.LESS_THAN, value);
  }

  lessThanOrEqual(field: string, value: any): this {
    return this.where(field, FilterOperator.LESS_THAN_OR_EQUAL, value);
  }

  like(field: string, value: string): this {
    return this.where(field, FilterOperator.LIKE, value);
  }

  in(field: string, values: any[]): this {
    return this.where(field, FilterOperator.IN, values);
  }

  notIn(field: string, values: any[]): this {
    return this.where(field, FilterOperator.NOT_IN, values);
  }

  between(field: string, min: any, max: any): this {
    return this.where(field, FilterOperator.BETWEEN, [min, max]);
  }

  isNull(field: string): this {
    return this.where(field, FilterOperator.IS_NULL, null);
  }

  isNotNull(field: string): this {
    return this.where(field, FilterOperator.IS_NOT_NULL, null);
  }

  apply(queryBuilder: SelectQueryBuilder<Entity>, alias = 'entity'): SelectQueryBuilder<Entity> {
    this.conditions.forEach((condition, index) => {
      const paramName = `${condition.field}_${index}`;
      const fieldPath = `${alias}.${condition.field}`;

      switch (condition.operator) {
        case FilterOperator.EQUALS:
          queryBuilder.andWhere(`${fieldPath} = :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.NOT_EQUALS:
          queryBuilder.andWhere(`${fieldPath} != :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.GREATER_THAN:
          queryBuilder.andWhere(`${fieldPath} > :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.GREATER_THAN_OR_EQUAL:
          queryBuilder.andWhere(`${fieldPath} >= :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.LESS_THAN:
          queryBuilder.andWhere(`${fieldPath} < :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.LESS_THAN_OR_EQUAL:
          queryBuilder.andWhere(`${fieldPath} <= :${paramName}`, { [paramName]: condition.value });
          break;

        case FilterOperator.LIKE:
          queryBuilder.andWhere(`${fieldPath} LIKE :${paramName}`, {
            [paramName]: `%${condition.value}%`,
          });
          break;

        case FilterOperator.IN:
          queryBuilder.andWhere(`${fieldPath} IN (:...${paramName})`, {
            [paramName]: condition.value,
          });
          break;

        case FilterOperator.NOT_IN:
          queryBuilder.andWhere(`${fieldPath} NOT IN (:...${paramName})`, {
            [paramName]: condition.value,
          });
          break;

        case FilterOperator.BETWEEN: {
          const [min, max] = condition.value;
          const minParam = `${paramName}_min`;
          const maxParam = `${paramName}_max`;
          queryBuilder.andWhere(`${fieldPath} BETWEEN :${minParam} AND :${maxParam}`, {
            [minParam]: min,
            [maxParam]: max,
          });
          break;
        }

        case FilterOperator.IS_NULL:
          queryBuilder.andWhere(`${fieldPath} IS NULL`);
          break;

        case FilterOperator.IS_NOT_NULL:
          queryBuilder.andWhere(`${fieldPath} IS NOT NULL`);
          break;
      }
    });

    return queryBuilder;
  }

  clear(): this {
    this.conditions = [];
    return this;
  }
}
