import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1709324689315 implements MigrationInterface {
	name = 'SeedDb1709324689315';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`INSERT INTO tags (name) VALUES('meow'), ('moo'), ('peow')`,
		);
		//password is 123
		await queryRunner.query(
			`INSERT INTO users (username, email, password) VALUES ('foo', 'foo@foo.com', '$2b$10$s/kfA8du5XHf4loZJvio1uPebZG9mgK9kbjUDm37kzvn/6M.29YoO')`,
		);

		await queryRunner.query(
			`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First Article', 'First article description', 'First article body', 'meow,peow', 1), ('second-article', 'Second Article', 'Second article description', 'Second article body', 'meow,moo', 1)`,
		);
	}

	public async down(): Promise<void> {}
}
