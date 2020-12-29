import _ from 'lodash'

export function determineRowsToFetch(zoom, requestedBbox) {
  function getRow(lat) {
    const row = latitudeToTileRow(lat, zoom)
    return row
  }
  const row0 = getRow(requestedBbox[3])
  const row1 = getRow(requestedBbox[1]) + 1
  return _.range(row0, row1)
}

export function determineColumnsToFetch(zoom, requestedBbox) {
  function getColumn(lon) {
    const col = longitudeToTileColumn(lon, zoom)
    return col
  }
  const col0 = getColumn(requestedBbox[0])
  const col1 = getColumn(requestedBbox[2]) + 1
  return _.range(col0, col1)
}

function latitudeToTileRow(lat, zoom) {
  return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
}

function longitudeToTileColumn(lon, zoom) {
  return Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
}
