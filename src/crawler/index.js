import {program} from 'commander'
import {WmtsToMbtiles} from './wmts-to-mbtiles.js'

const DEFAULT_BBOX_FINLAND = '17.61 58.79 33.83 70.63'
const NLS_MVT_BASE_URL = 'https://avoin-karttakuva.maanmittauslaitos.fi/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/WGS84_Pseudo-Mercator/'

program
  .requiredOption('--apiKey [key]', 'NLS API key required for accessing MVTs')
  .requiredOption('--output [mbtiles]', 'Output file')
  .option('--minzoom [zoom]', 'Miminum zoom level', 0)
  .option('--maxzoom [zoom]', 'Maximum zoom level', 14)
  .option('--concurrency [n]', 'Number of concurrenct requests', 8)
  .option('--bbox [w s e n]', `Latitude and longitude values, eg. "${DEFAULT_BBOX_FINLAND}"`, DEFAULT_BBOX_FINLAND)

program.parse(process.argv)
const options = program.opts()

const {apiKey} = options
const bbox = options.bbox.split(' ').map(parseFloat)
const minzoom = Number(options.minzoom)
const maxzoom = Number(options.maxzoom)
const concurrency = Number(options.concurrency)

WmtsToMbtiles(options.output, NLS_MVT_BASE_URL, apiKey, 'finland', minzoom, maxzoom, bbox, concurrency)
  .catch(err => {
    if (err.response) {
      console.error(`HTTP request failed: ${err.response.status} ${err.response.statusText}`)
    } else {
      console.error(err)
    }
  })
