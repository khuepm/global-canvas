import {
  GlobeKitView, Icosphere, Points, CalloutManager, CalloutDefinition,
} from '../../../globekit.esm.js';

// Api Key from your GlobeKit account
const apiKey = '{YOUR_GLOBEKIT_API_KEY}';

import { TourCallout } from './tourcallout.js';

class MyGlobeKit {
  locations;

  currentLocation = -1;

  constructor(canvas) {
    /**
     * gkOptions setup some base settings in GlobeKit
     * note: the apiKey and wasmPath settings
     */
    this.gkOptions = {
      apiKey,
      wasmPath: '../../gkweb_bg.wasm',
      attributes: {
        alpha: false,
      },
    };

    // Create the GlobeKitView object
    // We pass in a function to get the tour started as onInit callback
    this.gkview = new GlobeKitView(canvas, this.gkOptions, () => {
      setInterval(this.goToNextLocation, 8000);
    });

    // Turn off interactivity
    this.gkview.interactionController.isInteractive = false;

    // Set altitude of camera in earth radius
    this.gkview.movementModel.setAlt(8);

    this.gkview.onSelection = (list) => {};

    // **********************************************************************
    //                   CALLOUTMANAGER
    // **********************************************************************
    // Callout manager moves callouts to keep them attached to their points
    this.calloutManager = new CalloutManager(document.getElementById('callout-manager'));
    this.calloutManager.autoRemoveCallouts = false;
    this.gkview.registerCalloutManager(this.calloutManager);

    // **********************************************************************
    //                   ICOSPHERE
    // **********************************************************************
    this.icosphere = new Icosphere('./assets/worldmap.jpg');
    this.icosphere.setInteractive(false, false, false);
    this.gkview.addDrawable(this.icosphere, () => {
      this.gkview.startDrawing();
    });

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

    // Fetch the geojson data
    fetch('./data/locations.json')
      .then((response) => response.json())
      .then((data) => {
        this.locations = data;
        this.points = new Points();
        this.points.addGeojson(data);
        this.points.setInteractive(false, false, false);
        this.gkview.addDrawable(this.points);
      });
    this.gkview.addDrawable(this.points);
  }

  // Iterate over locations.json
  getNextLocation = () => {
    this.currentLocation += 1;
    if (this.currentLocation >= this.locations.features.length) {
      this.currentLocation = 0;
    }

    const loc = this.locations.features[this.currentLocation];
    return {
      lat: loc.geometry.coordinates[1],
      lon: loc.geometry.coordinates[0],
      properties: loc.properties,
    };
  }

  setCallout = (properties) => {
  }

  // **********************************************************************
  //                   ANIMATION
  // **********************************************************************
  // Animate to next location in location.json
  goToNextLocation = () => {
    this.calloutManager.removeAllCallouts();
    const loc = this.getNextLocation();
    const animationProps = {
      duration: 3000,
      onComplete: () => {
        // Remove any callouts
        this.calloutManager.removeAllCallouts();
        // Place callout defined by TourCallout at lat/lon with properties
        this.calloutManager.addCallout(new CalloutDefinition(loc.lat, loc.lon, TourCallout, loc.properties));
      },
    };

    // Turn off ambient motions
    this.gkview.ambientController.isEnabled = false;

    // Animate camera to location
    this.gkview.animationController.animateLatLonAlt(loc.lat, loc.lon, 3, animationProps);
  }
}

export { MyGlobeKit };
