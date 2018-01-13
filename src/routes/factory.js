const express = require('express')
const packageConfig = require('../../package.json')

function createRoutes (bots) {
  const router = express.Router()

  router.get('/', (req, res) => {
    const message = `Running gamebot server version: ${packageConfig.version}, serving up ${bots.length} bots.`
    console.log('[Routes Factory]', message)
    res.send(message)
  })

  return router
}

module.exports = createRoutes
