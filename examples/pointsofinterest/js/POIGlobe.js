import {
  GlobeKitView, Icosphere, Points, Arc, CalloutManager, CalloutDefinition,
} from '../../../globekit.esm.js';

import { POIPinCallout } from './POIPinCallout.js';
import { POIDetailCallout } from './POIDetailCallout.js';

// Api Key from your GlobeKit account
const apiKey = '{YOUR_GLOBEKIT_API_KEY}';

class POIGlobe {
  constructor(canvas, calloutContainer) {
    /**
     * gkOptions setup some base settings in GlobeKit
     * note: the apiKey and wasmPath settings
     */
    this.gkOptions = {
      apiKey,
      wasmPath: '../../gkweb_bg.wasm',
    };

    // Create the GlobeKitView object
    this.gkview = new GlobeKitView(canvas, this.gkOptions);

    // **********************************************************************
    //                   CALLOUTMANAGER
    // **********************************************************************
    // Callout manager moves callouts to keep them attached to their points
    this.calloutManager = new CalloutManager(calloutContainer);
    this.gkview.registerCalloutManager(this.calloutManager);

    // This gets called when the calloutManager removes a callout, i.e. when it rotates behind the globe.
    this.calloutManager.shouldAutoRemoveCallout = (def) => {
      if (def.calloutClass === POIPinCallout) {
        return false;
      }
      return true;
    };

    // DOM onClick callback
    this.onPinClick = this.onPinClick.bind(this);
    calloutContainer.addEventListener('pinclick', this.onPinClick);

    // **********************************************************************
    //                   ICOSPHERE
    // **********************************************************************
    this.icosphere = new Icosphere('./assets/worldmap.jpg');
    // You should not have to touch this.
    this.icosphere.setInteractive(true, true, false);
    this.gkview.addDrawable(this.icosphere, () => {
      this.gkview.startDrawing();
    });

    // **********************************************************************
    //                   PINS
    // **********************************************************************
    this.pinDefs = [];
    fetch('./data/offices.json')
      .then((response) => response.json())
      .then((data) => {
        this.pinDefs = data.features.map((el) => {
          const lat = el.geometry.coordinates[1];
          const lon = el.geometry.coordinates[0];
          return new CalloutDefinition(lat, lon, POIPinCallout, el.properties);
        });
        this.calloutManager.replaceCallouts(this.pinDefs);
      });

    // If clicking on the globe surface, deselect current
    this.gkview.onTap = () => {
      this.selectedDetailDef = null;
      this.calloutManager.replaceCallouts(this.pinDefs);
    };
  }

  // Pin click callback
  onPinClick(e) {
    const lat = e.detail.latitude;
    const lon = e.detail.longitude;
    const data = e.detail.data;
    this.selectedDetailDef = new CalloutDefinition(lat, lon, POIDetailCallout, data);
    this.calloutManager.replaceCallouts([...this.pinDefs, this.selectedDetailDef]);
  }
}

export { POIGlobe };
