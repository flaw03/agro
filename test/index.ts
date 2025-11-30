// Re-export common abstractions for easier imports in tests
export { AbstractMapper } from '../src/common/abstractions/abstract.mapper';
export { AbstractService } from '../src/common/abstractions/abstract-service';
export type { PaginatedResult } from '../src/common/abstractions/abstract-service';
export { AbstractFilter } from '../src/common/abstractions/abstract-filter';
export { AbstractReferentialService } from '../src/common/abstractions/abstract-referential.service';
export { AbstractReferentialController } from '../src/common/abstractions/abstract-referential.controller';

// Re-export common DTOs
export type { QueryParams } from '../src/common/dto/query-params';
export { SortOrder } from '../src/common/dto/sort-order';
export type { Referential } from '../src/common/dto/referential';

// Re-export common types
export { FilterOperator } from '../src/common/abstractions/filter-operator.enum';

export { Endpoint } from '../src/endpoint';
