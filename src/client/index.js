import React from 'react'
import ReactDOM from 'react-dom'
import {createMap} from './map'

class MVTApp extends React.PureComponent {
  componentDidMount() {
    this.map = createMap({x: 2863137.299863, y: 9532395.520719, zoom: 5}, 'openlayers')
  }

  render() {
    return <div id="openlayers"></div>
  }
}

ReactDOM.render(<MVTApp />, document.getElementById('app'))
