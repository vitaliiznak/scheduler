import bodyParser from 'body-parser'
import { Router } from 'express'
import { celebrate, Joi } from 'celebrate'
import moment from 'moment'
import expressJwt from 'express-jwt'
import SqlString from 'sqlstring'

import { executeWithConnection } from 'src/db_connection'

const sqlEscape = SqlString.escape.bind(SqlString)

export default () => {
  const router = new Router()

  router.get(
    '/',
    celebrate({
      query: Joi.object().keys({})
    }),
    (req, res) =>
      executeWithConnection(async conn => {
        let finalSelect = `SELECT
        slot.id, slot.time_range, slot.creator, "user".name as creator_name
        FROM slot
        LEFT JOIN "user" ON "user".id = slot.creator
       `
        // res.send(finalSelect)
        const slotsRes = await conn.query(finalSelect)
        const formattedRes = slotsRes.rows.map(({ time_range, ...rest }) =>
          //@refactor take it normaly from Postgres driver
          ({ ...rest, time_range: JSON.parse(time_range) })
        )
        res.json(formattedRes)
      })
  ),
  router.get(
    '/:id',
    celebrate({
      params: Joi.object({
        id: Joi.number()
      })
    }),
    (req, res) =>
      executeWithConnection(async conn => {
        const { id } = req.params
        let finalSelect = `SELECT
        slot.id, slot.time_range, slot.creator, "user".name as creator_name
        FROM slot
        LEFT JOIN "user" ON "user".id = slot.creator
        WHERE slot.id=${sqlEscape(id)}
       `
        // res.send(finalSelect)
        const slotsRes = await conn.query(finalSelect)

        if (slotsRes.rows.length < 1) {
          res.status(404)
        }
        const formattedRes = slotsRes.rows.map(({ time_range, ...rest }) =>
        //@refactor take it normaly from Postgres driver
          ({ ...rest, time_range: JSON.parse(time_range) })
        )
        res.json(formattedRes[0])
      })
  )

  router.post(
    '/',
    expressJwt({ secret: process.env.JWT_SECRET }),
    bodyParser.json(),
    celebrate({
      body: Joi.object().keys({
        /* userId: Joi.string().required(),*/
        creator_role: Joi.string()
          .required()
          .valid('INTERVIEWER', 'CANDIDATE'),
        from: Joi.string()
          .isoDate()
          .required(),
        to: Joi.string()
          .isoDate()
          .required()
      })
    }),
    (req, res, next) =>
      executeWithConnection(async conn => {
        try {
          const { from, to, creator_role } = req.body
          const mFrom = moment(from)
          const mTo = moment(to)
          if (mFrom > mTo) {
            return res.status(400).json({
              message: '"from" parameter must be smaller then "to" parameter'
            })
          }
          // req.user._id // take it from the loggedin user
          const query = `INSERT INTO
          "slot" (
            time_range,
            creator,
            creator_role
            )
          VALUES (
            '[${from}, ${to}]',
            ${sqlEscape(req.user.id)},
            ${sqlEscape(creator_role)}
            )
          RETURNING * ` // @TODO fix to prevent possible SQL injection
          const result = await conn.query(query)
          if (result.rowCount < 1) {
            return res.status(500).json({ message: 'User not created' })
          }
          const slotCreated = result.rows[0]
          return res.status(201).json(slotCreated)
        } catch (err) {
          next(err)
        }
      })
  )

  return router
}
