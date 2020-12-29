# maanmittauslaitos-mvt

Download NLS vector tiles (MVT) into an MBTILES file and visualize them with an OpenLayers browser UI.

Requires:
 - node.js v14+

## Crawl NLS WMTS service for vector tiles and save them to an .mbtiles file locally

```
node src/crawler/index.js --help

Usage: index [options]

Options:
  --apiKey [key]      NLS API key required for accessing MVTs
  --output [mbtiles]  Output file
  --minzoom [zoom]    Miminum zoom level (default: 0)
  --maxzoom [zoom]    Maximum zoom level (default: 14)
  --concurrency [n]   Number of concurrenct requests (default: 8)
  --bbox [w s e n]    Latitude and longitude value
```

Simple example for downloading all of Finland with zoom levels 0...14

`node src/crawler/index.js --apiKey xx-xxx-xxx --output taustakartta.mvt`

Remember to replace `xx-xxx-xxx` with your own NLS api key (register at https://omatili.maanmittauslaitos.fi)

## Serve a downloaded mbtiles file

```
node src/server/index.js --help
Usage: index [options]

Options:
  --input [mbtiles]  Input file
  --port [port]      HTTP port to listen on (default: 3000)
  -h, --help         display help for command
```

`node src/server/index.js --input taustakartta.mvt` 

Navigate to `http://localhost:3000`

![screenshot](https://raw.githubusercontent.com/heikkipora/maanmittauslaitos-mvt/main/screenshot.png)
