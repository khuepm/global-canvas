import {
  GlobeKitView, PointGlobe, Points, Atmosphere, Background, GKUtils,
} from '../../../globekit.esm.js';

// Api Key from your GlobeKit account
const apiKey = '{YOUR_GLOBEKIT_API_KEY}';

// Texture object for PointGlobe sparkle/shimmer
const textures = {
  // Clouds.png is availible in assets folder
  noise: './assets/clouds.png',
};

// Makes a random geojson object of count length. This should be replaced with a geojson asset load
const generateRandomGeoJson = (count) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  for (let i = 0; i < count; i += 1) {
    const feature = {
      type: 'Feature',
      properties: {

      },
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    };

    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    // Geojson records longitude first, this is a common gotcha
    feature.geometry.coordinates = [lon, lat];

    // Geojson properties are the catchall for any data values
    feature.properties.mythicalCreatureSightings = Math.floor(Math.random() * 30);

    geojson.features.push(feature);
  }

  return geojson;
};

// Generate some random Geojson
const randomGeojson = generateRandomGeoJson(10000);

class MyGlobeKit {
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
    this.gkview = new GlobeKitView(canvas, this.gkOptions);

    // **********************************************************************
    //                   ONSELECTION
    // **********************************************************************
    // onSelection gets called when the globe reports a selection event
    this.gkview.onSelection = (list) => {
      // Uncomment this line to see the list object
      // console.log(list);

      // Iterate over the drawables that reported a selection
      list.drawables.forEach((el) => {
        // This gets run if the points object is selected
        if (el.obj.id === this.pointglobe.id) {
          // Check that selection is valid
          if (el.selection !== undefined) {
            // Create a ripple at the location with duration of 3 seconds
            this.pointglobe.rippleAtLocation(el.selection.lat, el.selection.lon, 3000);
          }
        } else if (el.obj.id === this.points.id) {
          if (el.selection !== undefined) {
            // Do something with selected point
          }
        }
      });
    };

    // **********************************************************************
    //                   BACKGROUNDS
    // **********************************************************************
    // Backgrounds provide more control over the look of the rendered scene
    // They require a texture image source
    this.background = new Background('./assets/bg.png');
    // Adding this drawable first ensures that it is drawn first.
    this.gkview.addDrawable(this.background);

    // **********************************************************************
    //                   ATMOSPHERES
    // **********************************************************************
    this.atmosphere = new Atmosphere({
      texture: './assets/disk.png',
    });
    this.atmosphere.nScale = 1.02;
    this.gkview.addDrawable(this.atmosphere);

    // **********************************************************************
    //                   POINTGLOBE
    // **********************************************************************
    // Load the binary from static server
    fetch('./assets/pointglobe.bin')
      .then((res) => res.arrayBuffer())
      .then((data) => {
        // Some pointglobe settings
        const pointglobeParams = {
          pointSize: 0.004,
          randomPointSizeVariance: 0.004,
          randomPointSizeRatio: 0.1,
          minPointAlpha: 0.0,
          minPointSize: 0.006,
          color: '#F300A6',
        };
        this.pointglobe = new PointGlobe(textures, data, pointglobeParams);
        this.pointglobe.setInteractive(true, true, false);
      })
      .then(() => {
        // Add the drawable, start drawing when it finishes
        this.gkview.addDrawable(this.pointglobe, () => {
          this.gkview.startDrawing();
        });

        // **********************************************************************
        //                   POINTS
        // **********************************************************************
        this.points = new Points();

        // Transforms allow you to specify how data influences geometry
        this.points.transform = (element, point) => {
          // We are lerping colors based on a property from the geojson
          point.color = GKUtils.lerpColor('#ff0000', '#00ff00', element.properties.mythicalCreatureSightings / 30);
          // Transforms have to return the point object
          return point;
        };
        // Add geojson to the points object now that the transform is defined
        this.points.addGeojson(randomGeojson);
        this.points.setInteractive(true, true, false);
        this.gkview.addDrawable(this.points);
      });
  }
}

export { MyGlobeKit };
