import * as pg from 'pg'

const pool = new pg.Pool({
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
})

async function prepare() {
  const client = await pool.connect()
  const schema = process.env.DATABASE_SCHEMA

  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await client.query(`SET search_path TO ${schema}`)
  await client.query(`
    --CREATE OR REPLACE type user_type AS ENUM('INTERVIEWER', 'CANDIDATE');

    DROP TABLE IF EXISTS "user" CASCADE;
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        name text NOT NULL,
        password_hash text NOT null,
        UNIQUE (name)
    );

    DROP TABLE IF EXISTS slot CASCADE;
    CREATE TABLE IF NOT EXISTS slot  (
        id SERIAL PRIMARY KEY,
        time_range tstzrange not null,
        creator_role text NOT NULL,
        creator SERIAL references "user"(id) ON DELETE CASCADE
    );
  `)
  console.log('done')
  process.exit()
}

prepare()
