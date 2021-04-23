const config = fetch("./js/config.json")
  .then((res) => res.json())
  .then((configObject) => init(configObject));

const layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
};

const init = async (config) => {
  // initialize the map
  mapboxgl.accessToken = config.accessToken;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: config.style, // style URL
    center: [9, 17], // starting position [lng, lat]
    zoom: 2, // starting zoom
    scrollZoom: false,
    interactive: false,
  });

  // add the data layers to the map
  addLayers(map);
  // select search input
  const searchInput = document.querySelector("#search");
  // select search container
  const searchContainer = searchInput.parentElement;
  // select use my location button
  const locationButton = document.querySelector(".search__location-button");

  const features = document.createElement("div");
  features.setAttribute("id", "features");

  config.chapters.forEach((record, idx) => {
    /* These first two variables will hold each vignette, the chapter
      element will go in the container element */
    const container = document.createElement("div");
    const chapter = document.createElement("div");
    // Creates the title for the vignettes
    if (record.title) {
      const title = document.createElement("h3");
      title.innerText = record.title;
      chapter.appendChild(title);
    }
    // Creates the image for the vignette
    if (record.image) {
      const image = new Image();
      image.src = record.image;
      chapter.appendChild(image);
    }
    // Creates the image credit for the vignette
    if (record.imageCredit) {
      const imageCredit = document.createElement("p");
      imageCredit.classList.add("imageCredit");
      imageCredit.innerHTML = `Image credit: ${record.imageCredit}`;
      chapter.appendChild(imageCredit);
    }
    // Creates the description for the vignette
    if (record.description) {
      const story = document.createElement("p");
      story.innerHTML = record.description;
      chapter.appendChild(story);
    }
    // Sets the id for the vignette and adds the step css attribute
    container.setAttribute("id", record.id);
    container.classList.add("step");
    if (idx === 0) {
      container.classList.add("active");
    } else {
      container.classList.add("eraseFromDom");
    }
    // Sets the overall theme to the chapter element
    chapter.classList.add(config.theme);
    /* Appends the chapter to the container element and the container
      element to the features element */
    container.appendChild(chapter);
    features.appendChild(container);
  });

  locationButton.addEventListener("click", getGeoLocation);

  searchInput.addEventListener("input", (e) => {
    // if querystring contains spaces replace this with %20
    let queryString = e.target.value.replace(/\s/g, "%20");
    // geocoding api source: https://docs.mapbox.com/api/search/geocoding/#mapboxplaces
    const fetchedOptions = fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?country=nl&access_token=${mapboxgl.accessToken}`
    )
      .then((res) => res.json())
      .then((data) => data);
    // handles the choice of an address
    chooseAddress(fetchedOptions);
  });

  const chooseAddress = async (data) => {
    // removes the options container from DOM if it's already there
    if (document.querySelector(".options__container") !== null) {
      document.querySelector(".options__container").remove();
    }
    // wait for the data
    const rawData = await data;
    // select only the features array
    const addressOptions = rawData.features;
    // create a element to store the address options in
    const optionsContainer = document.createElement("ul");
    optionsContainer.classList.add("options__container");
    // make a element for each adrress option
    addressOptions.forEach((option) => {
      // make a list item for each option
      const listItem = document.createElement("li");
      // set the innerHTML of listItem to the placename of the object
      listItem.innerHTML = option.place_name;
      // append the listitem to the options container
      optionsContainer.appendChild(listItem);
      // add a click event to each
      listItem.addEventListener("click", (e) => {
        // remove the whole search element from DOM
        searchInput.parentElement.parentElement.remove();
        // set the input value to the selected address
        searchInput.value = e.target.innerHTML;
        // plot the home location on the map
        plotHomeLocation(option.geometry.coordinates);
      });
    });
    // inject the options container between search container and location button
    searchContainer.insertBefore(optionsContainer, locationButton);
  };

  const plotHomeLocation = (coordinates) => {
    console.log(coordinates);

    config.chapters[0].location.center = coordinates;
    console.log(config);

    // let features = map.queryRenderedFeatures(coordinates);

    // console.log(features)

    const storyElement = document.createElement("div");
    storyElement.className = "story__container";

    storyElement.insertAdjacentHTML(
      "afterbegin",
      `<button data-attribute="story__prev-btn" class="story__prev-btn">Previous</button> <button class="story__next-btn">Next</button> `
    );

    storyElement.appendChild(features);

    document.querySelector("body").appendChild(storyElement);
    map.getSource("mark").setData({ type: "Point", coordinates: coordinates });

    // make query to get Dutch water data from tileset
    const query = `https://api.mapbox.com/v4/${config.tilesetConfig.tileset}/tilequery/${coordinates[0]},${coordinates[1]}.json?radius=${config.tilesetConfig.radius}&limit=${config.tilesetConfig.limit}&access_token=${mapboxgl.accessToken}`;

    //fetch the tileset data
    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        console.log("data: ", data);
        // select water spots that are further away than 1500 meters
        const longer = data.features.filter(
          (item) => item.properties.tilequery.distance > 1500
        );
        // select a random number from the array with longer distanced water spots
        const random = Math.floor(Math.random() * longer.length);

        const randomWaterSource = longer[random];
        console.log(randomWaterSource);
        // fill the tilequery data layer with a random object from the array
        const waterSource = map.getSource("tilequery");
        waterSource.setData(randomWaterSource);

        map.on("click", "tilequery-points", (e) =>
          console.log(randomWaterSource)
        );
        // route source used: geoconverter.hsr.ch
        // fetch a route for the water spot
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${waterSource._data.geometry.coordinates[0]},${waterSource._data.geometry.coordinates[1]};${coordinates[0]},${coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log(data.routes[0]);
            // fil the line data layer with the route to the waterspot
            map.getSource("line").setData(data.routes[0].geometry);
          });
      });

    // set center option for all chapters, as it will be the same for each
    config.chapters[0].location.center = coordinates;
    config.chapters[1].location.center = coordinates;
    config.chapters[2].location.center = coordinates;
    config.chapters[3].location.center = coordinates;
    config.chapters[4].location.center = coordinates;

    // set opacity for the first data layer
    config.chapters[0].onChapterEnter.forEach(setLayerOpacity);
    // fly to location of first data layer
    map.flyTo({
      center: config.chapters[0].location.center,
      zoom: 17,
      bearing: 0,
      speed: 1,
      curve: 1,
      easing: (t) => t,
      essential: true,
    });

    // add click event to the next button
    storyElement.children[0].addEventListener("click", (e) => {
      const children = [...e.target.nextElementSibling.nextElementSibling.children];
      updateStory(children, e, config, map, setLayerOpacity)
    });

    storyElement.children[1].addEventListener("click", (e) => {
      // function could look like this: updateStory(event, operator, method)
      const children = [...e.target.nextElementSibling.children];
      updateStory(children, e, config, map, setLayerOpacity)
    });
    calculateRadius(coordinates, map);
  };

  const getLayerPaintType = (layer) => {
    console.log("layer: ", layer);
    const layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
  };

  const setLayerOpacity = (layer) => {
    const paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function (prop) {
      map.setPaintProperty(layer.layer, prop, layer.opacity);
    });
  };
};

function getGeoLocation() {
  if (navigator.geolocation) {
    console.log(navigator.geolocation.getCurrentPosition(showPosition));
  } else {
    console.log("not working pall");
  }
}

function showPosition(position) {
  plotHomeLocation([position.coords.longitude, position.coords.latitude]);
}

function calculateRadius(coordinates, map) {
  const center = turf.point(coordinates);
  const radius = 6;
  const options = {
    // steps: 80,
    units: "kilometers",
  };

  const circle = turf.buffer(center, radius, options);
  map.getSource("radius").setData(circle);
}

function addLayers(map) {
  map.on("load", (e) => {
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
        "fill-color": "pink",
        "fill-opacity": 0,
      },
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
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0,
      },
    });
  });
}

function updateStory(elements, event, config, map, setLayerOpacity) {
  console.log("update story event: ", event.target.className);

  const currentChapterElement = elements.find((child) =>
    child.classList.contains("active")
  );
  const currentChapterObject = config.chapters.find(
    (chap) => chap.id === currentChapterElement.id
  );

  const findCurrentObject = (obj) => obj.id === currentChapterElement.id;

  let currInd = config.chapters.findIndex(findCurrentObject);

  let nextChapter;

  if (event.target.className === "story__next-btn") {
    nextChapter = config.chapters[++currInd];
    
    const nextChapterElement = elements.find(
      (child) => child.id === nextChapter.id
    );

    currentChapterElement.classList.remove("active");
    // currentChapterElement.classList.add('eraseFromDom')

    currentChapterElement.classList.add("eraseFromDom");
    nextChapterElement.classList.remove("eraseFromDom");
    const setActive = setTimeout(() => {
      nextChapterElement.classList.add("active");
    }, 1);
    if (currentChapterObject.onChapterExit.length > 0) {
      currentChapterObject.onChapterExit.forEach(setLayerOpacity);
    }

    map.flyTo(nextChapter.location);

    if (nextChapter.onChapterEnter.length > 0) {
      nextChapter.onChapterEnter.forEach(setLayerOpacity);
    } else {
      // console.log(e)
    }
  } else if (event.target.className === "story__prev-btn") {
    nextChapter = config.chapters[--currInd];

    const nextChapterElement = elements.find(
      (child) => child.id === nextChapter.id
    );

    currentChapterElement.classList.remove("active");

    currentChapterElement.classList.add("eraseFromDom");
    nextChapterElement.classList.remove("eraseFromDom");
    const setActive = setTimeout(() => {
      nextChapterElement.classList.add("active");
    }, 1);
    if (currentChapterObject.onChapterExit.length > 0) {
      let turnOfLayerList = [];

      currentChapterObject.onChapterExit.forEach((chap) => {
        if (chap.opacity > 0) {
          const turnOfLayer = {
            layer: chap.layer,
            opacity: 0,
          };

          setLayerOpacity(turnOfLayer);
          turnOfLayerList.push(turnOfLayer);
        }
      });

      turnOfLayerList.forEach(setLayerOpacity);
    }

    map.flyTo(nextChapter.location);

    if (nextChapter.onChapterEnter.length > 0) {
      nextChapter.onChapterEnter.forEach(setLayerOpacity);
    } else {
      console.log(e);
    }

  }
}
