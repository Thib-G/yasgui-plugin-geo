import '@zazuko/yasgui/build/yasgui.min.css';
import Yasgui from '@zazuko/yasgui';

import GeoPlugin from './geo-plugin';
//Register the plugin to Yasr
// yasr.plugins = { ...yasr.plugins, geo: new geoPlugin(yasr) };
Yasgui.Yasr.registerPlugin('geo', GeoPlugin);

const yasgui = new Yasgui(document.getElementById('yasgui'), {
  // Set the SPARQL endpoint
  requestConfig: {
    endpoint: 'https://fuseki.linked-data.goelff.be/sncb-facilities',
  },
  yasr: {
    pluginOrder: ['table', 'response', 'geo'], // Enable geo plugin alongside default table
    defaultPlugin: 'geo',
  },
});

const tab = yasgui.getTab();
const yasr = tab.yasr;
