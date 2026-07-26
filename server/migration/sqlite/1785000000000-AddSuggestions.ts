import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuggestions1785000000000 implements MigrationInterface {
  name = 'AddSuggestions1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "suggestion" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "category" integer NOT NULL DEFAULT (1), "status" integer NOT NULL DEFAULT (1), "message" text NOT NULL, "pageUrl" varchar, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdById" integer, "modifiedById" integer, CONSTRAINT "FK_suggestion_createdBy" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_suggestion_modifiedBy" FOREIGN KEY ("modifiedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suggestion_status" ON "suggestion" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suggestion_createdBy" ON "suggestion" ("createdById")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_suggestion_createdBy"`);
    await queryRunner.query(`DROP INDEX "IDX_suggestion_status"`);
    await queryRunner.query(`DROP TABLE "suggestion"`);
  }
}
