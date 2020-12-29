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
      const tile = await fetchTile(client, row, column, zoom, apiKey)
      await db.putTile(tile, zoom, column, row)
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

async function fetchTile(client, row, column, zoom, apiKey) {
  const params = {
    'api-key': apiKey
  }

  return (await client.get(`${zoom}/${column}/${row}.pbf`, {params, responseType: 'arraybuffer'})).data
}

module.exports = WmtsToMbtiles
