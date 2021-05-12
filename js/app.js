import { Data } from "./modules/data.js";
import { Story } from "./modules/story.js";

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

const date = new Date();

date.setHours(9, 0, 0, 0);

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
  Data.addLayers(map);
  // select search input
  const searchInput = document.querySelector("#search");
  // select search container
  const searchContainer = searchInput.parentElement;
  // select use my location button
  const locationButton = document.querySelector(".search__location-button");

  const features = document.createElement("div");
  features.setAttribute("id", "features");

  Story.createDomElements(config, features);

  locationButton.addEventListener("click", Data.getGeoLocation);

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
        searchInput.parentElement.previousElementSibling.remove();
        searchInput.parentElement.remove();
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
      `
      <progress class="story__progression animated" value="0" max="100"></progress>
      <div class="story__button-container">
      <button data-attribute="story__prev-btn" class="story__prev-btn">
          <
      </button>
      <button class="story__next-btn">
          >
      </button> 
      </div>
      `
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
          (item) => item.properties.tilequery.distance > 4500
        );
        // select a random number from the array with longer distanced water spots
        const random = Math.floor(Math.random() * longer.length);

        const randomWaterSource = longer[random];
        // console.log(randomWaterSource);
        // fill the tilequery data layer with a random object from the array
        const waterSource = map.getSource("tilequery");
        waterSource.setData(randomWaterSource);

        console.log('waterSource: ', waterSource)

        

        map.on("click", "tilequery-points", (e) =>
          console.log(randomWaterSource)
        );
        // route source used: geoconverter.hsr.ch
        // fetch a route for the water spot

        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates[0]},${coordinates[1]};${waterSource._data.geometry.coordinates[0]},${waterSource._data.geometry.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("route data: ", data.routes[0]);

            const completeDuration = Math.floor(data.routes[0].duration / 60);

            console.log("complete duration: ", completeDuration);
            console.log("half duration: ", completeDuration / 2);

            // console.log('timeee: ', Math.floor(data.routes[0].duration / 60), ' min')

            // fil the line data layer with the route to the waterspot
            const smoothenAnimation = turf.bezierSpline(
              data.routes[0].geometry
            );
            map.getSource("line").setData(data.routes[0].geometry);

            const middleOfRoute =
              data.routes[0].geometry.coordinates[
                Math.floor((data.routes[0].geometry.coordinates.length - 1) / 2)
              ];
            const destination =
              data.routes[0].geometry.coordinates[
                data.routes[0].geometry.coordinates.length - 1
              ];
            
            // turned of for now as don't want to pass api limts
            function initialize() {
              // Search for Google's office in Australia.
              const request = {
                location: { lat: destination[1], lng: destination[0] },
                radius: "1"
              };
              // source: https://stackoverflow.com/questions/14343965/google-places-library-without-map
              const service = new google.maps.places.PlacesService(document.createElement('div'));
              service.nearbySearch(request, callback);
            }

            // Checks that the PlacesServiceStatus is OK, and adds a marker
            // using the place ID and location from the PlacesService.
            // source: https://developers.google.com/maps/documentation/javascript/places#find_place_requests
            function callback(results, status) {
              console.log(results)
              results.map(place => {
                if(place.photos) {
                  place.photos[0] = place.photos[0].getUrl()
                }
              })
              document.querySelector(".destination__img").src = results[0].photos[0] || results[1].photos[0]
            
              if(results[0].photos[0]) {
                generateCustomMarker(map, waterSource._data.geometry.coordinates, results[0].photos[0])
              } else {
                generateCustomMarker(map, waterSource._data.geometry.coordinates, results[1].photos[0])
              }

              

            }
            generateCustomMarker(map, waterSource._data.geometry.coordinates, 'https://www.loudounwater.org/sites/default/files/source%20water_19273373_LARGE.jpg')
            
            // initialize()


            config.chapters[5].location.center = middleOfRoute;
            config.chapters[9].location.center = middleOfRoute;
            config.chapters[10].location.center = middleOfRoute;
            console.log('index 10: ', config.chapters[10])
            config.chapters[5].time = (completeDuration / 2) * 3;
            config.chapters[6].time = (completeDuration / 2) * 4;
            config.chapters[6].location.center = destination;
            config.chapters[7].location.center = destination;
            config.chapters[8].location.center = destination;
            config.chapters[3].location.center = middleOfRoute;
            console.log("middle of route: ", config.chapters[5]);
            
            map
              .getSource("half-way")
              .setData({ type: "Point", coordinates: middleOfRoute });
            map
              .getSource("arrived")
              .setData({ type: "Point", coordinates: destination });
            config.chapters[6].location.center = map.getSource(
              "arrived"
            )._data.coordinates;
          });
      });

    // set center option for all chapters, as it will be the same for each
    config.chapters[0].location.center = coordinates;
    config.chapters[1].location.center = coordinates;
    config.chapters[2].location.center = coordinates;
    // config.chapters[3].location.center = coordinates;
    config.chapters[4].location.center = coordinates;

    // console.log(map.getSource("arrived")._data.coordinates)
    // config.chapters[5].location.center = coordinates;

    // set opacity for the first data layer
    config.chapters[0].onChapterEnter.forEach(setLayerOpacity);
    // fly to location of first data layer
    map.flyTo(config.chapters[0].location);
    // prepare radius data layer
    calculateRadius(coordinates, map);

    // init animate function
    let counter = 0;
    let route = map.getSource("line");
    console.log("lalala ", route);
    console.log(route);

    // add click event to the next button
    storyElement.children[0].addEventListener("click", (e) => {
      const children = [...e.target.parentElement.nextElementSibling.children];
      Story.update(children, e, config, map, setLayerOpacity, date);
    });

    storyElement.children[1].addEventListener("click", (e) => {
      // function could look like this: updateStory(event, operator, method)
      const children = [...e.target.parentElement.nextElementSibling.children];
      Story.update(children, e, config, map, setLayerOpacity, date);
    });
  };

  const getLayerPaintType = (layer) => {
    // console.log("layer: ", layer);
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

function generateCustomMarker(map, coordinates, imageSource) {
    // create a HTML element for each feature
    const el = document.createElement('div');
    const arrowDown = document.createElement('div');
    const waterSourceImg = new Image()

    waterSourceImg.src = imageSource
    waterSourceImg.classList.add('water-source__img')
    arrowDown.classList.add('arrow-down')
    el.classList.add('water-source__container')

    el.appendChild(waterSourceImg)

    el.className = 'marker';

    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map);
}