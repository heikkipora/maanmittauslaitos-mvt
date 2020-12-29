import fs from 'fs'
import Promise from 'bluebird'
import MBTiles from '@mapbox/mbtiles'

export async function createMBTiles(file, overwriteIfPresent = false) {
  if (overwriteIfPresent) {
    try {
      await fs.promises.unlink(file)
    } catch (ignored) {
    }
  }

  const mbtiles = await Promise.fromCallback(cb => new MBTiles(`${file}?mode=rwc`, cb))

  await Promise.fromCallback(cb => mbtiles.startWriting(cb))

  function close() {
    return Promise.fromCallback(cb => mbtiles.stopWriting(cb))
  }

  function putInfo(name, minzoom, maxzoom, bbox) {
    const info = {
      name,
      format: 'pbf',
      minzoom,
      maxzoom,
      bounds: bbox.join(','),
      type: 'baselayer'
    }
    return Promise.fromCallback(cb => mbtiles.putInfo(info, cb))
  }

  async function hasTile(z, x, y) {
    try {
      await getTile(z, x, y)
      return true
    } catch (err) {
      return false
    }
  }

  async function getTile(z, x, y) {
    return Promise.fromCallback(cb => mbtiles.getTile(z, x, y, cb))
  }

  async function putTile(pbfTile, z, x, y) {
    return Promise.fromCallback(cb => mbtiles.putTile(z, x, y, pbfTile, cb))
  }

  return {
    putInfo,
    hasTile,
    getTile,
    putTile,
    close
  }
}
