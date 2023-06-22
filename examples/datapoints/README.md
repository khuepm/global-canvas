# Datapoints Globe

## Features this file shows how to use:
- Pointglobe
- Loading a Geometry Binary
- High Volume Data Viz (10,000+)
- Interactivity
- Loading data from a json file

## Instructions

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

#### Step 2: Setup the PointGlobe

globe.js:
```
const textures = {
  noise: '{path/to/clouds.png}',
};

fetch('{path/to/pointglobe.bin}')
  .then((res) => res.arrayBuffer())
  .then((data) => {

    // Set the color 
    const pointglobeParams = {
      color: '#F300A6',
    };

    // 
    const pointglobe = new PointGlobe(textures, data, pointglobeParams);

    pointglobe.setInteractive(true, true, false);
  })
  .then(() => {
    
    // Add drawable to gkview and register a callback to be executed 
    gkview.addDrawable(pointglobe, () => {
      // Start Rendering
      gkview.startDrawing();
    });
  });
```

#### Step 3: Setup data points drawable
Next we are going to setup our Points data drawable. This will allow us to place a point at a location on the globe. The properties of these points can be driven by a datapoint property.

The `transform` function on the Points object takes a single data element and transform the base geometry by some property. You can see below how we are driving the point colors based off of a property of the element.

globe.js:
```
const points = new Points();

// Transforms allow you to specify how data influences geometry
this.points.transform = (element, point) => {

  // We are lerping colors based on a property from the geojson
  point.color = GKUtils.lerpColor('#ff0000', '#00ff00', element.properties.mythicalCreatureSightings / 30);

  // Transforms have to return the point object
  return point;
};

// Add geojson to the points object now that the transform is defined
this.points.addGeojson({YOUR_GEOJSON_OBJECT});
this.points.setInteractive(true, true, false);
this.gkview.addDrawable(points);
```

#### Step 4: Interactivity
Now we want to have something happen when we click on the globe.

We do this by attaching a `onSelection` callback to the `GlobeKitView`. This function gets a list of all selections reported by the drawables currently on the `GlobeKitView`. We are logging the list object to the console in the code below to illustrate this in action. 

We iterate over the list object comparing the drawable ids to determine what action to take. The selection could report `undefined` if there is no result, so checking for this is good practice. 

```
  // onSelection gets called when the globe reports a selection event
  gkview.onSelection = (list) => {
    console.log(list);

    // Iterate over the drawables that reported a selection
    list.drawables.forEach((el) => {

      // This gets run if the points object is selected
      if (el.obj.id === this.pointglobe.id) {
      
        // Check that selection is valid
        if (el.selection !== undefined) {

          // Create a ripple at the location with duration of 3 seconds
          pointglobe.rippleAtLocation(el.selection.lat, el.selection.lon, 3000);
        }
      
      } else if (el.obj.id === this.points.id) {

        if (el.selection !== undefined) {
        
          // Do something with selected point
          console.log(el.selection);
        }
      }
    });
  };
```

#### Step 5: Background

Now we would like to add an image as the background for the entire scene. The draw queue is dependent on the order in which `addDrawable` is called. So the background should be the first added to the view.

```
// Backgrounds provide more control over the look of the rendered scene
// They require a texture image source
const background = new Background('./assets/bg.png');
// Adding this drawable first ensures that it is drawn first.
gkview.addDrawable(background);
```

#### Step 6: PointGlobe backgrounds

The PointGlobe shows the background and sometimes this is the desired look, other times, its is not. Lets show how to add a different background to just the PointGlobe.

Using an Atmosphere object will get the desired look. Our image in this case is a black disk centered in a square transparent background. 

This should be added after the Background in step 5.

```
cosnt atmosphere = new Atmosphere({
  texture: './assets/disk.png',
});

// Tune this number to line up the image with the edges of the pointglobe
atmosphere.nScale = 1.02;
gkview.addDrawable(atmosphere);
```

### Conclusion:

Now you should have a PointGlobe with a dataset displaying on your screen. Now you can tweak the look and functionality to fit your design. 

#### More info here docs.globekit.co
