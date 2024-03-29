import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';

export const config: PostgresConnectionOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'mediumclone',
	password: '123',
	database: 'mediumclone',
	entities: [__dirname + '/**/*.entity{.ts, .js}'],
	synchronize: false,
	migrations: [__dirname + '/migrations/**/*{.ts, .js}'],
};

export default new DataSource(config);
