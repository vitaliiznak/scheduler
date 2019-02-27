import { Router } from 'express'
import SqlString from 'sqlstring'

import { executeWithConnection } from 'src/db_connection'

const sqlEscape = SqlString.escape.bind(SqlString)

export default () => {
  const router = new Router()

  router.get('/:id', (req, res) =>
    executeWithConnection(async conn => {
      let queryString = `SELECT id, name FROM "user"  WHERE slot.id=${sqlEscape(
        id
      )}`
      const userRes = await conn.query(queryString)
      res.json(userRes.rows)
    })
  )

  router.get('/', (req, res) =>
    executeWithConnection(async conn => {
      let queryString = 'SELECT id, name FROM "user"'
      const userRes = await conn.query(queryString)
      res.json(userRes.rows)
    })
  )
  return router
}
