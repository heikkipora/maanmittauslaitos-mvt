const axios = require('axios')
const {createMBTiles} = require('./mbtiles-db')
const https = require('https')
const Promise = require('bluebird')
const {determineRowsToFetch, determineColumnsToFetch} = require('./utils')

async function WmtsToMbtiles(mbtilesFile, wmtsUrl, apiKey, name, minzoom, maxzoom, bbox, concurrency) {
  const client = axios.create({
    baseURL: wmtsUrl,
    httpsAgent: new https.Agent({keepAlive: true}),
    timeout: 10 * 1000
  })

  const db = await createMBTiles(mbtilesFile)
  await db.putInfo(name, minzoom, maxzoom, bbox)

  for (let zoom = minzoom; zoom <= maxzoom; zoom += 1) {
    await fetchTiles(db, client, apiKey, zoom, bbox, concurrency)
  }

  await db.close()
  console.log(`All done for ${mbtilesFile}`)
}

async function fetchTiles(db, client, apiKey, zoom, bbox, concurrency) {
  const rows = determineRowsToFetch(zoom, bbox)
  const columns = determineColumnsToFetch(zoom, bbox)
  const tileCount = columns.length * rows.length

  console.log(`\nFetching tiles foor zoom ${zoom}: ${columns.length} x ${rows.length} = ${tileCount} tiles`)

  const start = Date.now()

  for (const [i, row] of rows.entries()) {
    await Promise.map(columns, async (column) => {
      const hasTile = await db.hasTile(zoom, column, row)
      if (!hasTile) {
        const tile = await fetchTileWithRetry(client, zoom, column, row, apiKey)
        await db.putTile(tile, zoom, column, row)  
      }
    }, {concurrency})
    const percentage = (i + 1) / rows.length * 100
    console.log(`${percentage.toFixed(1)} %`)
  }

  const end = Date.now()
  const minutes = (end - start) / 1000 / 60
  const perTile = (end - start) / tileCount
  console.log(`\nZoom level ${zoom} took ${minutes.toFixed(2)} minutes (${perTile.toFixed(0)} ms / tile)`)
  console.log(`Next zoom level should take about ${minutes.toFixed(2) * 4} minutes`)
}

async function fetchTileWithRetry(client, z, x, y, apiKey, retries = 10) {
  for (let retry = 0; retry < retries; retry += 1) {
    try {
      const tile = await fetchTile(client, z, x, y, apiKey)
      if (retry > 0) {
        console.log(`Retried tile ${z}/${y}/${x} ${retry} times`)
      }
      return tile
    } catch(err) {
      if (err.response && err.response.code < 500) {
        throw err
      }
    }
    await Promise.delay((retry + 1) * 500)
  }
  throw new Error(`Failed to fetch tile ${z}/${y}/${x}, tried ${retries} times`)
}

async function fetchTile(client, z, x, y, apiKey) {
  const params = {
    'api-key': apiKey
  }

  return (await client.get(`${z}/${y}/${x}.pbf`, {params, responseType: 'arraybuffer'})).data
}

module.exports = WmtsToMbtiles
