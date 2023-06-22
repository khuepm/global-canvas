# GlobeKit.js

### Examples

- Data points - 10,000 datapoints
- Headquarters - Connections to the home base
- Points of Interest - Use a DOM element as the marker
- Tour - Animate the camera between locations

### Things to note

- The current development runtime only works on localhost not 127.0.0.1, this is intentional. Please contact us if you are having problems with your development site.
- The size of the canvas is determined by CSS.
- To get the best results when using a texture, ensure the size of the texture is a power of 2, e.g. 256, 1024, 2048, etc. We are working on a system to automatically resize these images, but there is a performance cost, so it is currently best to avoid this all together.

### Files:

`globekit.ems.js` - GlobeKit module, **used in nearly all applications** so most likely you need to copy this file.

`globekit.cjs.js` - GlobeKit common js

`globekit.umd.js` - GlobeKit UMD.

`gkweb_bg.wasm` - needs to be served as a static resource

`./assets` - has the files for pointglobe and lowpoly globes.

'./examples' - get a sense of how to use GlobeKit in your projects.

### Getting Started

1. Copy `globekit.esm.js` into your source directory
2. Copy `gkweb_bg.wasm` into your static resources
3. Get your API Key from your GlobeKit Account Page

### Hello World

```
import { GlobeKitView, Icosphere } from "{path/to/globekit.esm.js}";

const apiKey = {your api key};
const options = {
  apiKey: apiKey,
  wasmPath: {path/to/gkweb_bg.wasm},
};

this.onInitCB = () => {};

this.gkview = new GlobeKitView(canvas, options, this.onInitCB);

this.icosphere = new Icosphere('{path/to/image/}');
this.gkview.addDrawable(this.icosphere, () => {
  this.gkview.startDrawing();
});
```

### Run examples

1. Change `{YOUR_API_KEY}` to your api key in the source files
2. Start a server in `/examples` `python3 -m http.server`
3. Open a browser

### Quick start example

```
import {GlobekitView, IcosphereDrawable, PointsDataDrawable, CalloutManager} from 'globekit';

class GlobeKitSample {

    constructor() {
        const canvas = document.getElementById('gk-canvas');
        const options = {};
        this.globeKitView = new GlobekitView(canvas, this.gkOnInit, options);
    }

    gkOnInit = (gkView) => {
        this.globe = new IcosphereDrawable('./path/to/texture.png');

        this.points = new PointsDataDrawable();
        this.points.attachDataset([]);
        this.points.onSelection = this.onSelection;

        this.globeKitView.addDrawable(this.globe);
        this.globeKitView.addDrawable(this.points);

        const calloutHolder = document.getElementById('callout-holder');
        this.calloutManager = new CalloutManager(calloutHolder);
        this.globeKitView.attachCalloutManager(this.calloutManager);
    }

    onSelection = (selections) => {
        if (selections[0]) {
            this.calloutManager.replaceCallouts([selections[0]]);
        }
        else {
            this.calloutManager.removeAllCallouts();
        }
    }
}
```
