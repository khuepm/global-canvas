# Datapoints Globe

## Demos
- Icosphere
- Low Volume Data Viz with Texture mapping
- Interactive
- Single Arc drawing
- Callout Manager
- Loading data from a json file

#### Step 1: Setup a GlobeKitView

globe.js:
```
import {GlobeKitView, PointGlobe, Points} from 'path/to/globekit.esm.js';

const apiKey = '{YOUR_API_KEY}';

const canvas = document.getElementById('globekit-canvas');

const gkOptions = {
  apiKey,
  wasmPath: '{path/to/gkweb_bg.wasm}',
  attributes: {
    alpha: false,
  },
};

const gkview = new GlobeKitView(canvas, gkOptions);
```

#### Step 2: Setup the Icosphere
Lets get an Icosphere up on screen.

```
icosphere = new Icosphere('{Path/to/image/src}');
icosphere.setInteractive(true, true, false);
gkview.addDrawable(icosphere, () => {
  gkview.startDrawing();
});
```
Done.


#### Step 3: Put a basic pin at the Home Base
```
pin = new QuadNormal({
  texture: './assets/pin.png',
});

// Set the scale of the pin
pin.nScale = 1.5;

// Place pin at these lat/lon
pin.setPoint(41, -111);
gkview.addDrawable(pin);
```

#### Step 4: Add textured Points

```
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

// Get data for the points
fetch('./data/offices.json')
  .then((response) => response.json())
  .then((data) => {
    points.addGeojson(data);
  });
gkview.addDrawable(points);
```

#### Step 5: Draw an Arc onSelection
Add an empty Arc drawable at the bottom of the file.
```
const arcs = new Arc();
gkview.addDrawable(arcs);
```

Define the onSelection Callback on the GlobeKitView object.

```
// onSelection gets called when the globe reports a selection event
gkview.onSelection = (list) => {
  // Uncomment this line to see the list object
  // console.log(list);

  list.drawables.forEach((el) => {
    // This gets run if the points object is selected
    if (el.obj.id === points.id) {
      if (el.selection !== undefined) {
        const sel = el.selection[0][0];

        // Clear all effects
        arcs.removeAllArcs();

        // Create an arc from airport to resort
        const arcParams = {
          from: [sel.lat, sel.lon],
          to: [41, -111], 
          startColor: '#ffffff',
          startAlpha: 1.0,
          midWidth: 4,
        };

        // Draw the arc to the screen in 1 second
        arcs.addArc(arcParams, 1000);
      } else {
        // Remove all effects if no selection
        arcs.removeAllArcs();
      }
    }
  });
};
```
Now, when you click on a point, an Arc should draw from the selected point to Salt Lake City, UT.

#### Step 6: Setup the CalloutManager:

```
// Callout manager moves callouts to keep them attached to their points
// The CalloutManager uses a `div' to define the bounds for the callouts
calloutManager = new CalloutManager(document.getElementById('callout-manager'));
gkview.registerCalloutManager(calloutManager);

// This gets called when the calloutManager removes a callout, i.e. when it rotates behind the globe.
calloutManager.onAutoRemove = (def) => {
  arcs.removeAllArcs();
};
```

#### Step 7: Define a Callout

In a new file, OfficeCallout.js, define a class that displays the data from the Points data json. 

```
import { Callout } from '{path/to/globekit.esm.js';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class OfficeCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'office-callout';
    div.innerHTML = `<div class="callout-container">
      <h3>${this.definition.data.name}</h3>
      <table>
        <tbody>
          <tr>
            <td>Employees:</td>
            <td>${this.definition.data.employees}</td>
          </tr>
          <tr>
            <td>Bigfoot Tours Sold:</td>
            <td>${this.definition.data.bigfoot_tours_sold}</td>
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
  }
}

export { OfficeCallout };

```

#### Step 8: Show Callout onSelection

Import the callout into the main js file.

```
import { OfficeCallout } from './officecallout.js';
```

Update the `onSelection` to look like this.

```
// onSelection gets called when the globe reports a selection event
gkview.onSelection = (list) => {
  // Uncomment this line to see the list object
  // console.log(list);

  list.drawables.forEach((el) => {
    // This gets run if the points object is selected
    if (el.obj.id === points.id) {
      if (el.selection !== undefined) {
        const sel = el.selection[0][0];

        // Clear all effects
        calloutManager.removeAllCallouts();
        arcs.removeAllArcs();

        // Add the callout at location with properties
        calloutManager.addCallout(new CalloutDefinition(sel.lat, sel.lon, OfficeCallout, sel.properties));

        // Create an arc from airport to resort
        const arcParams = {
          from: [sel.lat, sel.lon],
          to: [41, -111],
          startColor: '#ffffff',
          startAlpha: 1.0,
          midWidth: 4,
        };

        // Draw the arc to the screen in 1 second
        arcs.addArc(arcParams, 1000);
      } else {
        // Remove all effects if no selection
        arcs.removeAllArcs();
        calloutManager.removeAllCallouts();
      }
    }
  });
};
```

The `addCallout` line is where we create a new instance of a callout at the specified location.

### Conclusion:

Now you should have an Icosphere that you can interact with on your screen. Now you can tweak the look and functionality to fit your design. 

#### More info here docs.globekit.co
