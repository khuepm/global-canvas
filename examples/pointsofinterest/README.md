# Points of Interest Globe

## Demos
- Icosphere
- PointOfInterest Data Viz using Calloutmanager
- Interactive
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
this.icosphere = new Icosphere('{Path/to/image/src}');
this.icosphere.setInteractive(true, true, false);
this.gkview.addDrawable(this.icosphere, () => {
  this.gkview.startDrawing();
});
```
Done.

#### Step 3: Setup CalloutManager

```
// Callout manager moves callouts to keep them attached to their points
calloutManager = new CalloutManager(calloutContainer);
gkview.registerCalloutManager(calloutManager);
```

### Step 4: Define Callouts

In a file called `PinCallout.js` define the callout that is aways displayed.

```
import { Callout } from '{path/to/globekit.esm.js}';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class POIPinCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'pin-callout';
    div.innerHTML = '<div class="callout-container"></div>';

    this.onClick = this.onClick.bind(this);
    div.addEventListener('click', this.onClick);

    return div;
  }

  // This function sets offsets for the htmlElement from the lat/lon coord
  setPosition(position) {
    const nx = position.screen.x - 21;
    const ny = position.screen.y - 60;
    this.element.style.transform = `translate(${nx.toFixed(2)}px, ${ny.toFixed(2)}px)`;
    this.element.style.zIndex = Math.round(10000 * position.screen.y);

    if (position.world.similarityToCameraVector < 0.3) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }

  onClick() {
    this.element.dispatchEvent(new CustomEvent('pinclick', { bubbles: true, detail: this.definition }));
  }
}

export { POIPinCallout };
```

Now define a Callout to display when someone clicks on the PinCallout in a file `DetailCallout.js`

```
import { Callout } from '{path/to/globekit.esm.js}';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class POIDetailCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'poi-callout';
    div.innerHTML = `<div class="callout-container">
      <h3>${this.definition.data.name}</h3>
      <table>
        <tbody>
          <tr>
            <td>Bigfoot Sightings:</td>
            <td>${this.definition.data.bigfoot_sightings}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
    return div;
  }

  // This function sets offsets for the htmlElement from the lat/lon coord
  setPosition(position) {
    const nx = position.screen.x - 29;
    const ny = position.screen.y - 187;
    this.element.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(0)}px)`;
    this.element.style.zIndex = Math.round(10000 * position.screen.y);

    if (position.world.similarityToCameraVector < 0.3) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }
}

export { POIDetailCallout };

```

Import these classes into main js file:
```
import { POIPinCallout } from './PinCallout.js';
import { POIDetailCallout } from './DetailCallout.js';
```

#### Step 5: Place Callouts at locations

Load locations from a geojson file and create callouts

```
pinDefs = [];
fetch('./data/offices.json')
  .then((response) => response.json())
  .then((data) => {
    this.pinDefs = data.features.map((el) => {
      const lat = el.geometry.coordinates[1];
      const lon = el.geometry.coordinates[0];
      return new CalloutDefinition(lat, lon, POIPinCallout, el.properties);
    });
    calloutManager.replaceCallouts(this.pinDefs);
  });

// If clicking on the globe surface, deselect current
this.gkview.onTap = () => {
  selectedDetailDef = null;
  calloutManager.replaceCallouts(this.pinDefs);
};
```

Define autoremove callout behavior for the CalloutManager

```
calloutManager.shouldAutoRemoveCallout = (def) => {
  if (def.calloutClass === POIPinCallout) {
    return false;
  }
  return true;
};
```

#### Step 6: Create Detail Callout onSelection

Add `onPinClick` function.
```
// Pin click callback
onPinClick(e) {
  const lat = e.detail.latitude;
  const lon = e.detail.longitude;
  const data = e.detail.data;
  selectedDetailDef = new CalloutDefinition(lat, lon, POIDetailCallout, data);
  calloutManager.replaceCallouts([...pinDefs, selectedDetailDef]);
}
```

Add callbacks

```
// If clicking on the globe surface, deselect current
gkview.onTap = () => {
  selectedDetailDef = null;
  calloutManager.replaceCallouts(pinDefs);
};

// DOM onClick callback
calloutContainer.addEventListener('pinclick', onPinClick);
```

### Conclusion:

Now you should have an Icosphere that you can interact with on your screen. Now you can tweak the look and functionality to fit your design. 

#### More info here docs.globekit.co
