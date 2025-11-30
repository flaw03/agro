import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import colors from 'colors';
import { CategoryEntity } from '../raw-material/category/category.entity';
import { RawMaterialEntity } from '../raw-material/raw-material.entity';
import { SEED_ORDER, SeedConfig } from './seed.config';

interface SeedResult {
  file: string;
  created: number;
  skipped: number;
  errors: number;
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name, {
    timestamp: false,
  });

  private readonly mocksPath = path.join(__dirname, 'mocks');

  private readonly seededFiles = new Set<string>();

  private readonly repositories: Map<string, Repository<any>>;

  constructor(
    @InjectRepository(CategoryEntity)
    categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(RawMaterialEntity)
    rawMaterialRepository: Repository<RawMaterialEntity>,
  ) {
    this.repositories = new Map<string, Repository<any>>([
      ['CategoryEntity', categoryRepository],
      ['RawMaterialEntity', rawMaterialRepository],
    ]);
  }

  async seed() {
    this.logger.log(colors.cyan('='.repeat(70)));
    this.logger.log('🌱 Starting database seeding from mock files...');
    this.logger.log(`📋 Total files to seed: ${SEED_ORDER.length}`);

    const results: SeedResult[] = [];

    try {
      this.validateSeedOrder();

      for (const config of SEED_ORDER) {
        const result = await this.seedFromConfig(config);
        results.push(result);
      }

      this.displaySummary(results);
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error.message);
      throw error;
    }
  }

  private validateSeedOrder() {
    this.logger.log('🔍 Validating seed order and dependencies...');

    const processedFiles = new Set<string>();

    for (const config of SEED_ORDER) {
      // Check that all dependencies have been defined before
      if (config.dependencies && config.dependencies.length > 0) {
        for (const dep of config.dependencies) {
          if (!processedFiles.has(dep)) {
            throw new Error(
              `Invalid seed order: "${config.file}" depends on "${dep}" but "${dep}" is not seeded before it`,
            );
          }
        }
      }

      // Check that the file is not duplicated
      if (processedFiles.has(config.file)) {
        throw new Error(`Duplicate seed file: "${config.file}"`);
      }

      processedFiles.add(config.file);
    }

    this.logger.log('✓ Seed order validation passed');
  }

  private async seedFromConfig(config: SeedConfig): Promise<SeedResult> {
    this.logger.log(colors.cyan('='.repeat(70)));
    this.logger.log(`Processing: ${config.file}`);

    // check dependencies
    if (config.dependencies && config.dependencies.length > 0) {
      this.logger.log(`  ⚡ Dependencies: ${config.dependencies.join(', ')}`);
      for (const dep of config.dependencies) {
        if (!this.seededFiles.has(dep)) {
          throw new Error(
            `Dependency not met: "${config.file}" requires "${dep}" to be seeded first`,
          );
        }
      }
    }

    // Load JSON file data
    const mockFile = path.join(this.mocksPath, `${config.file}.json`);
    const result: SeedResult = {
      file: config.file,
      created: 0,
      skipped: 0,
      errors: 0,
    };

    if (!fs.existsSync(mockFile)) {
      this.logger.error(`  ✗ Mock file not found: ${mockFile}`);
      result.errors = 1;
      return result;
    }

    try {
      this.logger.log(`  📄 Loading: ${config.file}.json`);
      const mockData = JSON.parse(fs.readFileSync(mockFile, 'utf-8'));

      if (!Array.isArray(mockData)) {
        throw new TypeError(`Mock file must contain an array: ${config.file}.json`);
      }

      this.logger.log(`  🔄 Found ${mockData.length} items to seed`);

      const stats = await this.seedEntity(config, mockData);
      result.created = stats.created;
      result.skipped = stats.skipped;
      result.errors = stats.errors;
    } catch (error: any) {
      this.logger.error(`  ✗ Error loading/processing ${config.file}:`, error.message);
      result.errors = 1;
    }

    this.seededFiles.add(config.file);

    return result;
  }

  private async seedEntity(
    config: SeedConfig,
    items: any[],
  ): Promise<{ created: number; skipped: number; errors: number }> {
    let created = 0;
    let skipped = 0;
    let errors = 0;

    const repository = this.getRepository(config.entityName);

    for (const itemData of items) {
      try {
        const existing = await this.findExisting(repository, config, itemData);

        if (existing) {
          this.logger.log(`  - Exists: ${itemData[config.uniqueField]}`);
          skipped++;
          continue;
        }

        const entityData = await this.prepareEntityData(config, itemData);
        await this.createEntity(repository, entityData, itemData[config.uniqueField]);

        created++;
      } catch (error: any) {
        this.logger.error(
          `  ✗ Error seeding ${itemData[config.uniqueField] || 'item'}:`,
          error.message,
        );
        errors++;
      }
    }

    return { created, skipped, errors };
  }

  private getRepository(entityName: string): Repository<any> {
    const repository = this.repositories.get(entityName);
    if (!repository) {
      throw new Error(`Repository not found for entity: ${entityName}`);
    }
    return repository;
  }

  private async findExisting(
    repository: Repository<any>,
    config: SeedConfig,
    itemData: any,
  ): Promise<any> {
    const whereClause = { [config.uniqueField]: itemData[config.uniqueField] };
    return repository.findOne({ where: whereClause });
  }

  private async prepareEntityData(config: SeedConfig, itemData: any): Promise<any> {
    const entityData: any = { ...itemData };

    await this.resolveRelations(config, itemData, entityData);
    this.applyFieldMappings(config, itemData, entityData);

    return entityData;
  }

  private async resolveRelations(
    config: SeedConfig,
    itemData: any,
    entityData: any,
  ): Promise<void> {
    if (!config.relations) {
      return;
    }

    for (const [jsonField, relationConfig] of Object.entries(config.relations)) {
      if (itemData[jsonField] === undefined) {
        continue;
      }

      entityData[relationConfig.targetField] = await this.findRelatedEntity(
        relationConfig,
        itemData[jsonField],
      );
      delete entityData[jsonField];
    }
  }

  private async findRelatedEntity(relationConfig: any, lookupValue: any): Promise<any> {
    const relatedRepository = this.repositories.get(relationConfig.entity);
    if (!relatedRepository) {
      throw new Error(`Repository not found for relation entity: ${relationConfig.entity}`);
    }

    const relatedEntity = await relatedRepository.findOne({
      where: { [relationConfig.lookupField]: lookupValue },
    });

    if (!relatedEntity) {
      throw new Error(
        `${relationConfig.entity} not found with ${relationConfig.lookupField}=${lookupValue}`,
      );
    }

    return relatedEntity;
  }

  private applyFieldMappings(config: SeedConfig, itemData: any, entityData: any): void {
    if (!config.fieldMappings) {
      return;
    }

    for (const [targetField, source] of Object.entries(config.fieldMappings)) {
      if (typeof source === 'function') {
        entityData[targetField] = source(itemData);
      } else {
        entityData[targetField] = itemData[source];
      }
    }
  }

  private async createEntity(
    repository: Repository<any>,
    entityData: any,
    identifier: string,
  ): Promise<void> {
    const entity = repository.create(entityData);
    await repository.save(entity);
    this.logger.log(`  ✓ Created: ${identifier}`);
  }

  private displaySummary(results: SeedResult[]) {
    this.logger.log(colors.cyan('='.repeat(70)));
    this.logger.log(colors.cyan.bold('SEEDING SUMMARY'));
    this.logger.log(colors.cyan('='.repeat(70)));

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const result of results) {
      totalCreated += result.created;
      totalSkipped += result.skipped;
      totalErrors += result.errors;

      const fileName = result.file.padEnd(20);
      const created = colors.green(`Created: ${result.created.toString().padStart(3)}`);
      const skipped = colors.yellow(`Skipped: ${result.skipped.toString().padStart(3)}`);
      const errors =
        result.errors > 0
          ? colors.red(`Errors: ${result.errors.toString().padStart(3)}`)
          : colors.gray(`Errors: ${result.errors.toString().padStart(3)}`);

      this.logger.log(`${fileName} | ${created} | ${skipped} | ${errors}`);
    }

    this.logger.log(colors.cyan('='.repeat(70)));
    const totalLabel = colors.bold('TOTAL'.padEnd(17));
    const totalCreatedStr = colors.green.bold(`Created: ${totalCreated.toString().padStart(3)}`);
    const totalSkippedStr = colors.yellow.bold(`Skipped: ${totalSkipped.toString().padStart(3)}`);
    const totalErrorsStr =
      totalErrors > 0
        ? colors.red.bold(`Errors: ${totalErrors.toString().padStart(3)}`)
        : colors.gray.bold(`Errors: ${totalErrors.toString().padStart(3)}`);

    this.logger.log(
      `   ${totalLabel} | ${totalCreatedStr} | ${totalSkippedStr} | ${totalErrorsStr}`,
    );
    this.logger.log(colors.cyan('='.repeat(70)) + '\n');
  }
}
