import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'dpg-cq7ee0bqf0us7384ghu0-a.oregon-postgres.render.com',
  port: 5432,
  username: 'buda',
  password: 'xBGTGHfX5Pss2jqGYFV1yfFqeFEBdwWw',
  database: 'blooformsdb_p6u5',
  schema: 'public',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migration/*.ts'],
  synchronize: true,
  migrationsRun: true,
  ssl: {
    rejectUnauthorized: true,
  },
});
