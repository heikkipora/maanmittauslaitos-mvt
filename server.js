const program = require('commander')
const {initServer} = require('./src/mbtiles-server')

const cmd = program
  .requiredOption('--input [mbtiles]', 'Input file')
  .option('--port [port]', 'HTTP port to listen on', 3000)
  .parse(process.argv)

const {input} = cmd
const port = Number(cmd.port)

initServer(input)
  .then(() => console.log(`Tile server listening on port ${port}`))
  .catch(console.error)
