import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764463536126 implements MigrationInterface {
    name = 'InitialSchema1764463536126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar(50) NOT NULL, "label" varchar(255) NOT NULL, CONSTRAINT "UQ_77d7eff8a7aaa05457a12b8007a" UNIQUE ("code"))`);
        await queryRunner.query(`CREATE TABLE "raw_materials" ("id" varchar PRIMARY KEY NOT NULL, "nom" varchar(255) NOT NULL, "fournisseur" varchar(255) NOT NULL, "prix" decimal(10,2) NOT NULL, "stock_initial" decimal(10,2) NOT NULL, "stock_actuel" decimal(10,2) NOT NULL DEFAULT (0), "unite" varchar(50), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "categorie_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_raw_materials" ("id" varchar PRIMARY KEY NOT NULL, "nom" varchar(255) NOT NULL, "fournisseur" varchar(255) NOT NULL, "prix" decimal(10,2) NOT NULL, "stock_initial" decimal(10,2) NOT NULL, "stock_actuel" decimal(10,2) NOT NULL DEFAULT (0), "unite" varchar(50), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "categorie_id" integer NOT NULL, CONSTRAINT "FK_5de4b68f312abfd576853d7b9d9" FOREIGN KEY ("categorie_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_raw_materials"("id", "nom", "fournisseur", "prix", "stock_initial", "stock_actuel", "unite", "created_at", "updated_at", "categorie_id") SELECT "id", "nom", "fournisseur", "prix", "stock_initial", "stock_actuel", "unite", "created_at", "updated_at", "categorie_id" FROM "raw_materials"`);
        await queryRunner.query(`DROP TABLE "raw_materials"`);
        await queryRunner.query(`ALTER TABLE "temporary_raw_materials" RENAME TO "raw_materials"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "raw_materials" RENAME TO "temporary_raw_materials"`);
        await queryRunner.query(`CREATE TABLE "raw_materials" ("id" varchar PRIMARY KEY NOT NULL, "nom" varchar(255) NOT NULL, "fournisseur" varchar(255) NOT NULL, "prix" decimal(10,2) NOT NULL, "stock_initial" decimal(10,2) NOT NULL, "stock_actuel" decimal(10,2) NOT NULL DEFAULT (0), "unite" varchar(50), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "categorie_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "raw_materials"("id", "nom", "fournisseur", "prix", "stock_initial", "stock_actuel", "unite", "created_at", "updated_at", "categorie_id") SELECT "id", "nom", "fournisseur", "prix", "stock_initial", "stock_actuel", "unite", "created_at", "updated_at", "categorie_id" FROM "temporary_raw_materials"`);
        await queryRunner.query(`DROP TABLE "temporary_raw_materials"`);
        await queryRunner.query(`DROP TABLE "raw_materials"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
