import {neon} from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is missing.');
}

const sql = neon(databaseUrl);

export default sql;
