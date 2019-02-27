import * as pg from 'pg'

const pool = new pg.Pool({
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
})
const schema = process.env.DATABASE_SCHEMA

async function getConnection() {
  try {
    const client = await pool.connect()
    if (!client.isSetup) {
      await client.query(`SET search_path TO ${schema}`)
      //await client.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY')
      client.isSetup = true
    }
    return client
  } catch (err) {
    throw err
  }
}
export async function executeWithConnection(fn) {
  const client = await getConnection()
  try {
    return await fn(client)
  } catch (error) {
    try {
      await client.query('ROLLBACK')
      console.error(error)
    } catch (error2) {
      throw error2
    }
    throw error
  } finally {
    client.release()
  }
}
