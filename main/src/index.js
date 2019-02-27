import express from 'express'
import cors from 'cors'
import logger from 'morgan'

import authRoutes from './routes/auth'
import slotsRoutes from './routes/slots'
import overlapsRoutes from './routes/overlaps'
import usersRoutes from './routes/users'

const app = express()
app.use(cors())
app.use(logger('dev'))

app.use('/auth', authRoutes())
app.use('/users', usersRoutes())
app.use('/slots', slotsRoutes())
app.use('/overlaps', overlapsRoutes())

const port = process.env.PORT
// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.status(500).json(err)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
