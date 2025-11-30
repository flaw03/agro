export interface RelationConfig {
  entity: string;
  lookupField: string;
  targetField: string;
}

export interface SeedConfig {
  file: string;
  entityName: string;
  uniqueField: string;
  relations?: Record<string, RelationConfig>;
  fieldMappings?: Record<string, string | ((data: any) => any)>;
  dependencies?: string[];
}

export const SEED_ORDER: SeedConfig[] = [
  {
    file: 'categories',
    entityName: 'CategoryEntity',
    uniqueField: 'code',
    dependencies: [],
  },
  {
    file: 'raw-materials',
    entityName: 'RawMaterialEntity',
    uniqueField: 'nom',
    relations: {
      categorieCode: {
        entity: 'CategoryEntity',
        lookupField: 'code',
        targetField: 'categorie',
      },
    },
    fieldMappings: {
      stockActuel: (data) => data.stockInitial, // Copier stockInitial vers stockActuel
    },
    dependencies: ['categories'],
  },
  // Ajouter ici les nouvelles entités en respectant l'ordre des dépendances
  // Exemple:
  // {
  //   file: 'recipes',
  //   entityName: 'RecipeEntity',
  //   uniqueField: 'name',
  //   relations: {
  //     rawMaterialId: {
  //       entity: 'RawMaterialEntity',
  //       lookupField: 'id',
  //       targetField: 'rawMaterial',
  //     },
  //   },
  //   dependencies: ['raw-materials'],
  // },
];
