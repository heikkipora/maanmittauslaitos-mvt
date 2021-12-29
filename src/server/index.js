import {program}  from 'commander'
import {initServer} from './tile-server.js'

program
  .requiredOption('--input [mbtiles]', 'Input file')
  .option('--port [port]', 'HTTP port to listen on', 3000)

program.parse(process.argv)
const options = program.opts()

const {input} = options
const port = Number(options.port)

initServer(input, port)
  .then(() => console.log(`Tile server listening on port ${port}`))
  .catch(console.error)
