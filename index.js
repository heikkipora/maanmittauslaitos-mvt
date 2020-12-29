#!/usr/bin/env node
const program = require('commander')
const WmtsToMbtiles = require('./src/wmts-to-mbtiles')

const DEFAULT_BBOX_FINLAND = '17.61 58.79 33.83 70.63'
const NLS_MVT_BASE_URL = 'https://avoin-karttakuva.maanmittauslaitos.fi/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/WGS84_Pseudo-Mercator/'

const cmd = program
  .requiredOption('--apiKey [key]', 'NLS API key required for accessing MVTs')
  .requiredOption('--output [mbtiles]', 'Output file')
  .option('--minzoom [zoom]', 'Miminum zoom level', 0)
  .option('--maxzoom [zoom]', 'Maximum zoom level', 14)
  .option('--concurrency [n]', 'Number of concurrenct requests', 8)
  .option('--bbox [w s e n]', `Latitude and longitude values, eg. "${DEFAULT_BBOX_FINLAND}"`, DEFAULT_BBOX_FINLAND)
  .parse(process.argv)

const {apiKey} = cmd
const bbox = cmd.bbox.split(' ').map(parseFloat)
const minzoom = Number(cmd.minzoom)
const maxzoom = Number(cmd.maxzoom)
const concurrency = Number(cmd.concurrency)

WmtsToMbtiles(cmd.output, NLS_MVT_BASE_URL, apiKey, 'finland', minzoom, maxzoom, bbox, concurrency)
  .catch(err => {
    if (err.response) {
      console.error(`HTTP request failed: ${err.response.status} ${err.response.statusText}`)
    } else {
      console.error(err)
    }
  })
