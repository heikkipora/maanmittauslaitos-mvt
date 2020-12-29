const compression = require('compression')
const express = require('express')
const {fromCallback} = require('bluebird')
const MBTiles = require('@mapbox/mbtiles')

async function initServer(mbtilesFile, port) {
  const mbtiles = await fromCallback(cb => new MBTiles(`${mbtilesFile}?mode=ro`, cb))
  const mbtilesInfo = await fromCallback(cb => mbtiles.getInfo(cb))
  console.log(mbtilesInfo)

  const app = express()
  app.disable('x-powered-by')
  app.use(compression())
  app.use(express.static('public'))

  app.get('/:z/:x/:y', (req, res) => {
    mbtiles.getTile(req.params.z, req.params.x, req.params.y, (err, data, headers) => {
      if (err) {
        res.status(404).send('Tile not found')
      } else {
        console.log(headers)
        res.send(data)
      }
    })
  })

  return new Promise(resolve => app.listen(port, resolve))
}

module.exports = {
  initServer
}