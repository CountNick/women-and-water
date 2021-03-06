export const Data = {
  addLayers: (map) => {
    map.on("load", (e) => {
      document.querySelector("body").classList.remove("prevent__click");
      document.querySelector("body").classList.remove("no-scroll");
      document.querySelector(".loader__container").remove();

      // map.style.stylesheet.layers.forEach(layer => {
      //   if(layer.type === 'symbol') {
      //     map.removeLayer(layer.id);
      //   }

      // })

      map.addSource("route-outline", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "route-outline",
        type: "line",
        source: "route-outline",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 5,
          "line-opacity": 0,
        },
      });

      map.addSource("line", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff1e00",
          "line-width": 4,
          "line-opacity": 0,
        },
      });

      map.addSource("first-half", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "first-half",
        type: "line",
        source: "first-half",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 4,
          "line-opacity": 0,
        },
      });

      map.addSource("second-half", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "second-half",
        type: "line",
        source: "second-half",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 4,
          "line-opacity": 0,
        },
      });

      map.addSource("mark", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "home-marker",
        type: "circle",
        source: "mark",
        paint: {
          "circle-opacity": 0,
          "circle-stroke-color": "yellow",
          "circle-color": "black",
          "circle-stroke-width": {
            // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 1],
              [18, 3],
            ],
            base: 5,
          },
          "circle-radius": {
            // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180],
            ],
            base: 5,
          },
        },
      });

      map.addSource("half-way", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "half-way",
        type: "circle",
        source: "half-way",
        paint: {
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
          "circle-stroke-color": "yellow",
          "circle-color": "black",
          "circle-stroke-width": {
            // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 1],
              [18, 3],
            ],
            base: 5,
          },
          "circle-radius": {
            // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180],
            ],
            base: 5,
          },
        },
      });

      map.addSource("arrived", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "arrived",
        type: "circle",
        source: "half-way",
        paint: {
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
          "circle-stroke-color": "yellow",
          "circle-color": "black",
          "circle-stroke-width": {
            // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 1],
              [18, 3],
            ],
            base: 5,
          },
          "circle-radius": {
            // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180],
            ],
            base: 5,
          },
        },
      });

      map.addSource("radius", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "circle-fill",
        type: "fill",
        source: "radius",
        opacity: 0,
        paint: {
          "fill-color": "transparent",
          "fill-opacity": 0,
          "fill-outline-color": "#d7a565",
        },
      });

      map.addLayer({
        id: "circle-outline",
        type: "line",
        source: "radius",
        opacity: 0,
        paint: {
          "line-color": "#d7a565",
          "line-opacity": 1,
          "line-width": 5,
          "line-offset": 5,
        },
        layout: {},
      });

      map.addSource("tilequery", {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        // Add a new layer to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addlayer
        id: "tilequery-points",
        type: "circle",
        source: "tilequery", // Set the layer source
        paint: {
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
          "circle-stroke-color": "white",
          "circle-stroke-width": {
            // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 0.1],
              [18, 3],
            ],
            base: 5,
          },
          "circle-radius": {
            // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180],
            ],
            base: 5,
          },
          "circle-color": [
            // Specify the color each circle should be
            "match", // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            ["get", "STORE_TYPE"], // Use the result 'STORE_TYPE' property
            "Convenience Store",
            "#FF8C00",
            "Convenience Store With Gas",
            "#FF8C00",
            "Pharmacy",
            "#FF8C00",
            "Specialty Food Store",
            "#9ACD32",
            "Small Grocery Store",
            "#008000",
            "Supercenter",
            "#008000",
            "Superette",
            "#008000",
            "Supermarket",
            "#008000",
            "Warehouse Club Store",
            "#008000",
            "#FF0000", // any other store type
          ],
        },
      });
    });
  },
  getGeoLocation: () => {
    if (navigator.geolocation) {
      console.log(navigator.geolocation.getCurrentPosition(Data.showPosition));
    } else {
      console.log("not working pall");
    }
  },
  showPosition: (position) => {
    plotHomeLocation([position.coords.longitude, position.coords.latitude]);
  },
  minutesToHours: (number) => {
    const hours = number / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    // console.log(num + " minutes = " + rhours + " hour(s) and " + rminutes + " minute(s).")
    // console.log(`${number} minutes = ${rhours} hour(s) and ${rminutes} minute(s)`)
    return `${rhours} hour(s) and ${rminutes} minute(s)`;
  },
};
