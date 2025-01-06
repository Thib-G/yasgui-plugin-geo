import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import parseWKT from 'wellknown';

const basemaps = {
  // OpenStreetMap
  openStreetMap: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors',
    },
  ),
  // OpenTopoMap
  openTopoMap: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap contributors',
  }),

  // ESRI World Imagery (Satellite)
  'ESRI World Imagery (Satellite)': L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  ),

  // CartoDB Voyager
  'CartoDB Voyager': L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; CartoDB',
    },
  ),
};

/**
 * Creates a GeoJSON object from SPARQL query bindings.
 *
 * @param {Array} bindings - An array of binding objects from a SPARQL query result.
 * @param {string} wktColumn - The key in the binding objects that contains the WKT (Well-Known Text) geometry.
 * @returns {Object} A GeoJSON object representing the features.
 */
const createGeojson = (bindings, wktColumn) => ({
  type: 'FeatureCollection',
  features: bindings.map((item) => ({
    type: 'Feature',
    properties: item,
    geometry: parseWKT(item[wktColumn].value),
  })),
});

/**
 * A plugin for YASR (Yet Another SPARQL Results) visualizer that displays geographic data on a map.
 * Requires Leaflet.js for map rendering.
 *
 * @class
 * @property {Object} yasr - The YASR instance this plugin is attached to
 * @property {number} priority - The plugin's priority in the YASR visualization order
 * @property {string} label - The display label for the plugin
 * @property {HTMLElement} container - The DOM container for the map
 * @property {L.Map} map - The Leaflet map instance
 * @property {L.LayerGroup} lg - The Leaflet layer group for results
 *
 * @description
 * This plugin creates an interactive map visualization for SPARQL query results that contain WKT (Well-Known Text)
 * geometric data. It plots the geometric data on an OpenStreetMap base layer and provides popup information
 * for each feature. The plugin automatically detects if it can handle the results by checking for columns
 * containing "WKT" in their name.
 */
class GeoPlugin {
  constructor(yasr) {
    this.yasr = yasr;
    this.priority = 30;
    this.label = 'Geo';
  }

  draw() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.style.height = '500px';
      this.container.style.width = '100%';
      const map = L.map(this.container, {
        center: [50 + 38 / 60 + 28 / 3600, 4 + 40 / 60 + 5 / 3600],
        zoom: 8,
      });
      basemaps.openStreetMap.addTo(map);
      const lg = L.featureGroup().addTo(map);
      L.control.layers(basemaps, { Results: lg }).addTo(map);
      this.map = map;
      this.lg = lg;
    }
    this.yasr.resultsEl.appendChild(this.container);

    const wktColumn = this.yasr.results.json.head.vars.find((col) =>
      col.includes('WKT'),
    );
    const geojson = createGeojson(
      this.yasr.results.json.results.bindings,
      wktColumn,
    );

    this.lg.clearLayers();

    const newLayers = L.geoJson(geojson, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 4,
          weight: 2,
          opacity: 0.7,
        }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const popupContent = Object.keys(p).map(
          (k) => `<b>${k}:</b> ${p[k].value}`,
        );
        layer.bindPopup(popupContent.join('<br>'));
      },
    });
    this.lg.addLayer(newLayers);

    // Fit bounds if layer has features
    if (geojson.features && geojson.features.length > 0) {
      console.log(this.lg.getBounds());
      this.map.fitBounds(this.lg.getBounds(), {
        padding: [20, 20],
        maxZoom: 12,
      });
    }

    // Force map to redraw
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  getIcon() {
    const icon = document.createElement('div');
    icon.innerHTML = '🌍';
    return icon;
  }

  canHandleResults() {
    const json = this.yasr.results.json;
    const columns = json.head.vars;

    return columns.some((col) => col.includes('WKT'));
  }
}

export default GeoPlugin;
