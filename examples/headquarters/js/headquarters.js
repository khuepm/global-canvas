import {
  GlobeKitView, Icosphere, Points, Arc, QuadNormal, CalloutManager, CalloutDefinition,
} from '../../../globekit.esm.js';

import { OfficeCallout } from './officecallout.js';

// Api Key from your GlobeKit account
const apiKey = '{YOUR_GLOBEKIT_API_KEY}';

class MyGlobeKit {
  constructor(canvas) {
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
    this.gkview.ambientController.isEnabled = false;
    this.gkview.movementModel.setLatLon(41, -111);

    // **********************************************************************
    //                   CALLOUTMANAGER
    // **********************************************************************
    // Callout manager moves callouts to keep them attached to their points
    this.calloutManager = new CalloutManager(document.getElementById('callout-manager'));
    this.gkview.registerCalloutManager(this.calloutManager);

    // This gets called when the calloutManager removes a callout, i.e. when it rotates behind the globe.
    this.calloutManager.onAutoRemove = (def) => {
      this.arcs.removeAllArcs();
    };

    // **********************************************************************
    //                   ONSELECTION
    // **********************************************************************
    // onSelection gets called when the globe reports a selection event
    this.gkview.onSelection = (list) => {
      // Uncomment this line to see the list object
      // console.log(list);

      list.drawables.forEach((el) => {
        // This gets run if the points object is selected
        if (el.obj.id === this.points.id) {
          if (el.selection !== undefined) {
            const sel = el.selection[0][0];

            // Clear all effects
            this.calloutManager.removeAllCallouts();
            this.arcs.removeAllArcs();

            // Add the callout at location with properties
            this.calloutManager.addCallout(new CalloutDefinition(sel.lat, sel.lon, OfficeCallout, sel.properties));

            // Create an arc from airport to resort
            const arcParams = {
              from: [sel.lat, sel.lon],
              to: [41, -111],
              startColor: '#ffffff',
              startAlpha: 1.0,
              midWidth: 4,
            };

            // Draw the arc to the screen in 1 second
            this.arcs.addArc(arcParams, 1000);
          } else {
            // Remove all effects if no selection
            this.arcs.removeAllArcs();
            this.calloutManager.removeAllCallouts();
          }
        }
      });
    };

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
    //                   QuadNormal
    // **********************************************************************
    this.pin = new QuadNormal({
      texture: './assets/pin.png',
    });
    // Set the scale of the pin
    this.pin.nScale = 1.5;
    // Place pin at these lat/lon
    this.pin.setPoint(41, -111);
    this.gkview.addDrawable(this.pin);

    // **********************************************************************
    //                   POINTS
    // **********************************************************************
    // Points data object
    this.points = new Points({
      useTexture: true,
      texture: './assets/target.png',
    });
    this.points.setInteractive(true, true, false);
    // This value sets the max distance to trigger a selection in km
    this.points.maxSelectionDistance = 200;

    // Define the points transform
    this.points.transform = (element, point) => {
      point.size = 24;
      return point;
    };

    // Get data for the points
    fetch('./data/offices.json')
      .then((response) => response.json())
      .then((data) => {
        this.points.addGeojson(data);
      });
    this.gkview.addDrawable(this.points);

    // **********************************************************************
    //                   ARC
    // **********************************************************************
    this.arcs = new Arc();
    this.gkview.addDrawable(this.arcs);
  }
}

export { MyGlobeKit };
