import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMiddleNameNullable1769082495150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "brivo_users" 
            ALTER COLUMN "middleName" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "brivo_users" 
            ALTER COLUMN "middleName" SET NOT NULL
        `);
  }
}
