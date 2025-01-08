import '@zazuko/yasgui/build/yasgui.min.css';
import Yasgui from '@zazuko/yasgui';

import GeoPlugin from 'yasgui-geo-tg';

//Register the plugin to Yasr
Yasgui.Yasr.registerPlugin('geo', GeoPlugin);

const yasgui = new Yasgui(document.getElementById('yasgui'), {
  // Set the SPARQL endpoint
  requestConfig: {
    endpoint: 'https://dbpedia.org/sparql',
  },
  yasr: {
    pluginOrder: ['table', 'response', 'geo'], // Enable geo plugin alongside default table
    defaultPlugin: 'geo',
  },
});
