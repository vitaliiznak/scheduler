import { Router } from 'express'
import { celebrate, Joi } from 'celebrate'
import SqlString from 'sqlstring'
import moment from 'moment'

import { executeWithConnection } from 'src/db_connection'

const sqlEscape = SqlString.escape.bind(SqlString)

export default () => {
  const router = new Router()
  router.get(
    '/',
    celebrate({
      query: Joi.object().keys({
        interviewers_and: Joi.array().items(Joi.number()),
        candidates_and: Joi.array().items(Joi.number())
      })
    }),
    (req, res) =>
      executeWithConnection(async conn => {
        let { candidates_and, interviewers_and } = req.query
        const candidates = [...new Set(candidates_and || [])]
        const interviewers = [...new Set(interviewers_and || [])]
        const users = interviewers
          .map(id => ({
            id,
            creator_role: 'INTERVIEWER'
          }))
          .concat(
            candidates.map(id => ({
              id,
              creator_role: 'CANDIDATE'
            }))
          )
        if (!users || !users.length) {
          return res.json([])
        }

        const slotsSelectCommon = `SELECT
          slot.id, slot.time_range, slot.creator, "user".name as creator_name
          FROM slot
          LEFT JOIN "user" ON "user".id = slot.creator
         `
        // only requested slots of candidate
        const userSlotsSelectTables = users.map(({ id, creator_role }) => {
          return `(${slotsSelectCommon}
              WHERE slot.creator_role=${sqlEscape(creator_role)}
              AND creator = ${sqlEscape(id)} )
              AS slots_of_creator_${creator_role}_${sqlEscape(id)}`
        })
        const tablesRanges = users.map(
          ({ id, creator_role }) =>
            `slots_of_creator_${creator_role}_${sqlEscape(id)}.time_range`
        )
        let finalSelect = ''
        if (tablesRanges.length > 1) {
          finalSelect = `SELECT  tstzrange(${tablesRanges.join(
            ' * '
          )}) AS "time_intersection", * FROM ${userSlotsSelectTables.reduce(
            (accum, tableQyery, index) => {
              if (index === 0) {
                return `${accum} ${tableQyery}`
              } else {
                return `${accum} INNER JOIN ${tableQyery} ON TRUE`
              }
            },
            ''
          )} WHERE tstzrange(${tablesRanges.join(' * ')}) != 'empty'`
        } else {
          finalSelect = `SELECT *, time_range AS "time_intersection" FROM ${
            userSlotsSelectTables[0]
          }`
        }

        //res.send(finalSelect)
        const slotsRes = await conn.query(finalSelect)

        const formattedRes = slotsRes.rows
          .map(({ time_intersection, ...rest }) =>
            //@refactor take it normaly from Postgres driver
            ({
              candidates,
              interviewers,
              time_intersection: JSON.parse(time_intersection)
            })
          )
          .filter(({ time_intersection: [from, to] }) => {
            const duration = moment.duration(moment(to).diff(moment(from)))
            return duration.asHours() > 0
          })
        return res.json(formattedRes)
      })
  )

  return router
}
