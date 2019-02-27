import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import { executeWithConnection } from 'src/db_connection'
import SqlString from 'sqlstring'

import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { celebrate, Joi, errors } from 'celebrate'

const sqlEscape = SqlString.escape.bind(SqlString)

export default () => {
  const router = new Router()
  router.post(
    '/register',
    bodyParser.json(),
    celebrate({
      body: Joi.object().keys({
        name: Joi.string().required(), // should add more validation but it serves for demostration purposes
        password: Joi.string().required()
      })
    }),
    (req, res, next) =>
      executeWithConnection(async conn => {
        try {
          const { name, password } = req.body
          const passwordHash = await bcrypt.hash(
            password.trim(),
            Number(process.env.SALT_ROUNDS)
          )
          const result = await conn.query(
            `INSERT INTO
          "user" ( name, password_hash)
          VALUES ($1, $2)
          RETURNING * `,
            [name, passwordHash]
          )
          if (result.rowCount < 1) {
            return res.status(500).json({ message: 'User not created' })
          }
          const userCreated = result.rows[0]
          const token = jwt.sign(
            {
              id: userCreated.id,
              name: userCreated.name
            },
            process.env.JWT_SECRET,
            { expiresIn: 10 * 60 * 60 } // 10 hours of expiration
          )
          return res.status(201).json({
            id: userCreated.id,
            name: userCreated.name,
            token
          })
        } catch (err) {
          next(err)
        }
      })
  )

  router.post(
    '/login',
    bodyParser.json(),
    celebrate({
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
      })
    }),
    (req, res, next) => {
      // login here
    }
  )

  return router
}
