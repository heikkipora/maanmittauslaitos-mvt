import styleFunction from 'ol-mapbox-style/dist/stylefunction'
import {defaults as defaultInteractions} from 'ol/interaction'
import glStyle from './style-contours.json'
import Map from 'ol/Map'
import MVT from 'ol/format/MVT'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import View from 'ol/View'
import {defaults as defaultControls} from 'ol/control'

export function createMap(settings, target) {
  const {x, y, zoom} = settings
  const center = [x, y]
  const view = new View({
    center,
    minZoom: 0,
    maxZoom: 20,
    projection: 'EPSG:3857',
    zoom
  })

  const map = new Map({
    controls: defaultControls({attribution: false, rotate: false}),
    interactions: defaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
    layers: [createMVTLayer()],
    target,
    view
  })

  return map
}

function createMVTLayer() {
  const source = new VectorTileSource({
    format: new MVT(),
    url: '/{z}/{x}/{y}.pbf',
    maxZoom: 14
  })

  const layer = new VectorTileLayer({
    declutter: true,
    source
  })
  styleFunction(layer, glStyle, 'taustakartta')
  return layer
}
