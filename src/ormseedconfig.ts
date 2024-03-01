import { config } from '@app/ormconfig';
import { DataSource } from 'typeorm';

const ormseedconfig = {
	...config,
	migrations: [__dirname + '/seeds/*.ts'],
};

export default new DataSource(ormseedconfig);
