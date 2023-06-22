# Tour Globe

## Demos
- IcosphereLookup
- Camera Animation 
- Loading data from a json file

#### Step 1: Setup a GlobeKitView with a Points data drawable 

globe.js:
```
/**
 * gkOptions setup some base settings in GlobeKit
 * note: the apiKey and wasmPath settings
 */
gkOptions = {
apiKey,
wasmPath: '../gkweb_bg.wasm',
attributes: {
  alpha: false,
},
};

// Create the GlobeKitView object
// We pass in a function to get the tour started as onInit callback
gkview = new GlobeKitView(canvas, gkOptions);

// Set altitude of camera in earth radius
this.gkview.movementModel.setAlt(8);

this.gkview.onSelection = (list) => {};

// **********************************************************************
//                   CALLOUTMANAGER
// **********************************************************************
// Callout manager moves callouts to keep them attached to their points
calloutManager = new CalloutManager(document.getElementById('callout-manager'));
calloutManager.autoRemoveCallouts = false;
gkview.registerCalloutManager(calloutManager);

// **********************************************************************
//                   ICOSPHERE
// **********************************************************************
icosphere = new Icosphere('./assets/worldmap.jpg');
icosphere.setInteractive(false, false, false);
gkview.addDrawable(icosphere, () => {
gkview.startDrawing();
});

// **********************************************************************
//                   POINTS
// **********************************************************************
// Points data object
points = new Points({
useTexture: true,
texture: './assets/target.png',
});
points.setInteractive(true, true, false);

// This value sets the max distance to trigger a selection in km
points.maxSelectionDistance = 200;

// Define the points transform
points.transform = (element, point) => {
  point.size = 24;
  return point;
};

// Fetch the geojson data
fetch('./data/locations.json')
.then((response) => response.json())
.then((data) => {
  locations = data;
  points = new Points();
  points.addGeojson(data);
  points.setInteractive(false, false, false);
  gkview.addDrawable(points);
});
gkview.addDrawable(points);
}
```

#### Step 2: Define a callout to display

In tourcallout.js:

```
import { Callout } from '/path/to/globekit.esm.js';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class TourCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'tour-callout';
    div.innerHTML = `<div class="callout-container">
      <h3>${this.definition.data.name}</h3>
      <table>
        <tbody>
          <tr>
            <td>Bigfoot Sightings:</td>
            <td>${this.definition.data.bigfootSightings}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
    return div;
  }

  // This function sets offsets for the htmlElement from the lat/lon coord
  setPosition(position) {
    const nx = position.screen.x - 85;
    const ny = position.screen.y - 123;
    this.element.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(0)}px)`;
    this.element.style.zIndex = Math.round(10000 * position.screen.y);

    if (position.world.similarityToCameraVector < 0.3) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }
}

export { TourCallout };

```

Then import that class into main js file:

```
import { TourCallout } from './tourcallout.js';
```

#### Step 3: Turn off interactivity and Create animation

Replace the GlobeKitView constructor with this

```
// We pass in a function to get the tour started as onInit callback
this.gkview = new GlobeKitView(canvas, this.gkOptions, () => {
  setInterval(goToNextLocation, 8000);
});

// Turn off interactivity
gkview.interactionController.isInteractive = false;
```

Add these functions to define the animations

```
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

setCallout = (properties) => {}

// **********************************************************************
//                   ANIMATION
// **********************************************************************
// Animate to next location in location.json
goToNextLocation = () => {
  calloutManager.removeAllCallouts();
  const loc = getNextLocation();
  const animationProps = {
    duration: 3000,
    onComplete: () => {
      // Remove any callouts
      calloutManager.removeAllCallouts();
      // Place callout defined by TourCallout at lat/lon with properties
      calloutManager.addCallout(new CalloutDefinition(loc.lat, loc.lon, TourCallout, loc.properties));
    },
  };

  // Turn off ambient motions
  gkview.ambientController.isEnabled = false;

  // Animate camera to location
  gkview.animationController.animateLatLonAlt(loc.lat, loc.lon, 3, animationProps);
}
```

### Conclusion:

Now you should have an Icosphere that animates to a location every 8 seconds. Now you can tweak the look and functionality to fit your design. 

#### More info here docs.globekit.co
