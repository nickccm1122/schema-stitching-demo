'use strict'

const koa = require('koa') // koa@2
const koaRouter = require('koa-router') // koa-router@next
const koaBody = require('koa-bodyparser') // koa-bodyparser@next
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa')

const genExecutableSchema = require('./schema')

const app = new koa()
const router = new koaRouter()
const PORT = 5002

// koaBody is needed just for POST.
router.post(
  '/graphql',
  koaBody(),
  graphqlKoa(async () => {
    const executableSchema = await genExecutableSchema()
    return {
      schema: executableSchema
    }
  })
)

router.get(
  '/graphql',
  graphqlKoa(async () => {
    const executableSchema = await genExecutableSchema()
    return {
      schema: executableSchema
    }
  })
)

router.get(
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql'
  })
)

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
