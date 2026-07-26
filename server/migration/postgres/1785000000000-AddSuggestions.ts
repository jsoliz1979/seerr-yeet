import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuggestions1785000000000 implements MigrationInterface {
  name = 'AddSuggestions1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "suggestion" ("id" SERIAL NOT NULL, "category" integer NOT NULL DEFAULT 1, "status" integer NOT NULL DEFAULT 1, "message" text NOT NULL, "pageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "modifiedById" integer, CONSTRAINT "PK_suggestion" PRIMARY KEY ("id"), CONSTRAINT "FK_suggestion_createdBy" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_suggestion_modifiedBy" FOREIGN KEY ("modifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suggestion_status" ON "suggestion" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suggestion_createdBy" ON "suggestion" ("createdById")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_suggestion_createdBy"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_suggestion_status"`);
    await queryRunner.query(`DROP TABLE "suggestion"`);
  }
}
