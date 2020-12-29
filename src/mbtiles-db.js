const {fromCallback} = require('bluebird')
const fs = require('fs')
const MBTiles = require('@mapbox/mbtiles')

async function createMBTiles(file) {
  try {
    await fs.promises.unlink(file)
  } catch (ignored) {
    // ignore error, likely file does not exist
  }
  const mbtiles = await fromCallback(cb => new MBTiles(`${file}?mode=rwc`, cb))

  await fromCallback(cb => mbtiles.startWriting(cb))

  function close() {
    return fromCallback(cb => mbtiles.stopWriting(cb))
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
    return fromCallback(cb => mbtiles.putInfo(info, cb))
  }

  async function putTile(pbfTile, z, x, y) {
    return fromCallback(cb => mbtiles.putTile(z, x, y, pbfTile, cb))
  }

  return {
    putInfo,
    putTile,
    close
  }
}

module.exports = {
  createMBTiles
}
