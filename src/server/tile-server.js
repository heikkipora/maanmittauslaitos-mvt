import compression from 'compression'
import express from 'express'
import Promise from 'bluebird'
import MBTiles from '@mapbox/mbtiles'

export async function initServer(mbtilesFile, port) {
  const mbtiles = await Promise.fromCallback(cb => new MBTiles(`${mbtilesFile}?mode=ro`, cb))

  const app = express()
  app.disable('x-powered-by')
  app.use(compression())
  app.use(express.static('public'))
  if (process.env.NODE_ENV == 'production') {
    app.enable('trust proxy')
  } else {
    const {bindDevAssets} = await import('./dev-assets.js')
    bindDevAssets(app)
  }

  app.get('/:z/:x/:y.pbf', (req, res) => {
    mbtiles.getTile(req.params.z, req.params.x, req.params.y, (err, data, headers) => {
      if (err) {
        res.status(404).send('Tile not found')
      } else {
        res.set(headers)
        res.send(data)
      }
    })
  })

  return new Promise(resolve => app.listen(port, resolve))
}
