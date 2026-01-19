import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1768825159207 implements MigrationInterface {
  name = 'Init1768825159207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brivo_users" ("id" SERIAL NOT NULL, "firstName" text NOT NULL, "lastName" text NOT NULL, "middleName" text NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "emails" jsonb NOT NULL DEFAULT '[]', "phoneNumbers" jsonb NOT NULL DEFAULT '[]', "externalId" character varying, "suspended" boolean, "customFields" jsonb, CONSTRAINT "PK_7fe1a9719b6a846dba57b498bef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "brivo_groups" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "antipassbackResetTime" integer, "keypadUnlock" boolean NOT NULL DEFAULT false, "immuneToAntipassback" boolean NOT NULL DEFAULT false, "excludedFromLockdown" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_8f287805c4847d0599f26f3e781" UNIQUE ("name"), CONSTRAINT "PK_cd85602b459d05aaed46e10826a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "brivo_groups_members_brivo_users" ("group_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_ac0f08de031f08a9c2596d2d97b" PRIMARY KEY ("group_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fd16977944a7b641694bfc67d" ON "brivo_groups_members_brivo_users" ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_298bb088d4d4d8cec38f9c3236" ON "brivo_groups_members_brivo_users" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "brivo_groups_members_brivo_users" ADD CONSTRAINT "FK_6fd16977944a7b641694bfc67d6" FOREIGN KEY ("group_id") REFERENCES "brivo_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "brivo_groups_members_brivo_users" ADD CONSTRAINT "FK_298bb088d4d4d8cec38f9c3236e" FOREIGN KEY ("user_id") REFERENCES "brivo_users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brivo_groups_members_brivo_users" DROP CONSTRAINT "FK_298bb088d4d4d8cec38f9c3236e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brivo_groups_members_brivo_users" DROP CONSTRAINT "FK_6fd16977944a7b641694bfc67d6"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_298bb088d4d4d8cec38f9c3236"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6fd16977944a7b641694bfc67d"`);
    await queryRunner.query(`DROP TABLE "brivo_groups_members_brivo_users"`);
    await queryRunner.query(`DROP TABLE "brivo_groups"`);
    await queryRunner.query(`DROP TABLE "brivo_users"`);
  }
}
