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

  // map._container.classList.add('introduction__step')
  // map._container.classList.add('eraseFromDom')

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
      console.log(option);
      listItem.innerHTML = option.place_name;
      // append the listitem to the options container
      optionsContainer.appendChild(listItem);
      // add a click event to each
      listItem.addEventListener("click", (e) => {
        // remove the whole search element from DOM
        // searchInput.parentElement.previousElementSibling.remove();
        // searchInput.parentElement.remove();
        searchInput.parentElement.previousElementSibling.classList.remove(
          "active"
        );
        searchInput.parentElement.classList.remove("active");
        // searchInput.parentElement.previousElementSibling.classList.add('eraseFromDom');
        // searchInput.parentElement.classList.add('eraseFromDom');

        searchInput.parentElement.previousElementSibling.addEventListener(
          "transitionend",
          (event) => {
            map._container.classList.remove("eraseFromDom");

            setTimeout(() => {
              map._container.classList.add("active");
            }, 1000);

            searchInput.parentElement.previousElementSibling.classList.add(
              "eraseFromDom"
            );
            searchInput.parentElement.classList.add("eraseFromDom");
          }
        );
        // searchInput.parentElement.previousElementSibling.classList.add('eraseFromDom');
        // searchInput.parentElement.classList.add('eraseFromDom');
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
    console.log("Home coordinates: ", coordinates);

    config.chapters[0].location.center = coordinates;
    console.log(config);

    // let features = map.queryRenderedFeatures(coordinates);

    // console.log(features)

    const storyElement = document.createElement("div");
    storyElement.className = "story__container";

    storyElement.insertAdjacentHTML(
      "afterbegin",
      `
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

    storyElement.insertAdjacentHTML(
      "beforeend",
      '<progress class="story__progression animated" value="0" max="100"></progress>'
    );

    document.querySelector("body").appendChild(storyElement);
    storyElement.insertAdjacentHTML(
      "afterend",
      '<button class="sharePage__open-btn">Share</button>'
    );

    const shareButton = document.querySelector(".sharePage__open-btn");

    shareButton.addEventListener("click", (e) => {
      document.querySelector("#map").classList.add("hide");
      document.querySelector(".story__container").classList.add("hide");
      document.querySelector(".hud__container").classList.add("hide");
      shareButton.classList.add("eraseFromDom");
    });

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

        const max = Math.max.apply(
          Math,
          data.features.map((item) => item.properties.tilequery.distance)
        );
        const noFurtherOption = data.features.find(
          (item) => item.properties.tilequery.distance === max
        );

        // select a random number from the array with longer distanced water spots
        const random = Math.floor(Math.random() * longer.length);

        const randomWaterSource = longer[random] || noFurtherOption;
        // console.log(randomWaterSource);
        // fill the tilequery data layer with a random object from the array
        const waterSource = map.getSource("tilequery");
        waterSource.setData(randomWaterSource);

        console.log("waterSource: ", waterSource);

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
            const completeDistance = data.routes[0].distance * 3;

            console.log("complete duration: ", completeDuration);
            console.log("half duration: ", completeDuration / 2);
            console.log(
              "random water source: ",
              randomWaterSource.properties.OWM_NAAM
            );

            document.querySelector(".watersource__name").textContent =
              randomWaterSource.properties.OWM_NAAM;

            document.querySelector(".watersource__distance").textContent = (
              data.routes[0].distance / 1000
            ).toFixed(1);

            document.querySelector(
              ".route__time"
            ).textContent = Data.minutesToHours(completeDuration * 2);

            document.querySelector(
              ".arrival__hours"
            ).textContent = Data.minutesToHours((completeDuration / 2) * 5);

            document.querySelector(
              ".total__hours"
            ).textContent = Data.minutesToHours(
              (completeDuration / 2) * 5 + completeDuration
            );

            document.querySelector(
              ".randomEvent__time"
            ).textContent = Data.minutesToHours(completeDuration);

            // document.querySelector(
            //   "#back_home"
            // ).firstElementChild.lastElementChild.innerHTML = `After coming home you look at the clock and realize you've just spend ${
            //   (completeDuration / 2) * 5 + completeDuration}. It's now <span class="ending__time">__current time__</p> this means that you missed a whole day of school. This is pretty standard in Niger as in 2018 the literacy rate for people between 15 and 24 years old was only 43%.`;

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

            const encodedLine = polyline.fromGeoJSON(
              map.getSource("line")._data
            );

            fetch(
              `https://api.mapbox.com/styles/v1/countnick/ckoa0w5zy1t3j18qkn25xwu6i/static/pin-s-a+9ed4bd(${
                map.getSource("mark")._data.coordinates[0]
              },${map.getSource("mark")._data.coordinates[1]}),pin-s-b+000(${
                map.getSource("tilequery")._data.geometry.coordinates[0]
              },${
                map.getSource("tilequery")._data.geometry.coordinates[1]
              }),path-5+f44-1(${encodeURIComponent(encodedLine)})/${
                middleOfRoute[0]
              },${
                middleOfRoute[1]
              },11,0,0/600x600?access_token=pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw`
            )
              .then((res) => res.blob())
              .then((blob) => {
                const img = URL.createObjectURL(blob);

                const shareRoutePage = document.createElement("div");

                shareRoutePage.classList.add("sharePage__container");

                shareRoutePage.insertAdjacentHTML(
                  "beforeend",
                  `
                    <div class="sharePage-header__container">
                      <h1 class="sharePage__title">My journey for water</h1>
                      <button class="sharePage__close-btn" data-html2canvas-ignore >close</button>
                    </div>
                    <img class="sharePage__image" src=${img} alt="myroute">
                  
                    <ul class="sharePage__list">
                        <li class="sharePage__list-item">Today I walked ${(
                          completeDistance / 1000
                        ).toFixed(1)} kilometers in total to get water.</li>
                        <li class="sharePage__list-item">On the road I got attacked by__.</li>
                        <li class="sharePage__list-item">The route cost me ___ hours to get back home.</li>
                    </ul>
                    <h2>Because of this I couldn't go to school</h2>



                    <a class="download__image unclickable" download="my-journey-for-water.png" href="" data-html2canvas-ignore>Download</a>

                  `
                );

                document.querySelector("body").appendChild(shareRoutePage);

                const closeButton = document.querySelector(
                  ".sharePage__close-btn"
                );
                const downloadButton = document.querySelector(
                  ".download__image"
                );

                closeButton.addEventListener("click", (e) => {
                  document.querySelector("#map").classList.remove("hide");
                  document
                    .querySelector(".story__container")
                    .classList.remove("hide");
                  document
                    .querySelector(".hud__container")
                    .classList.remove("hide");
                  shareButton.classList.remove("eraseFromDom");
                });

                // downloadButton.addEventListener('click', (e) => {
                //   e.preventDefault()

                html2canvas(document.querySelector(".sharePage__container"), {
                  allowTaint: true,
                  scale: 1,
                  windowWidth: 400,
                  width: 400,
                  windowHeight: 700,
                }).then((canvas) => {
                  // document.body.appendChild(canvas)
                  console.log(canvas);

                  const downloadButton = document.querySelector(
                    ".download__image"
                  );

                  const exportImg = canvas.toDataURL("image/png");
                  downloadButton.href = exportImg;

                  downloadButton.classList.remove("unclickable");

                  function debugBase64(base64URL) {
                    var win = window.open();
                    win.document.write(
                      '<iframe src="' +
                        base64URL +
                        '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
                    );
                  }

                  // downloadButton.addEventListener('click', (e) => {
                  //   e.preventDefault()
                  //   debugBase64(exportImg)

                  // });
                });

                // })
              });

            const destination =
              data.routes[0].geometry.coordinates[
                data.routes[0].geometry.coordinates.length - 1
              ];

            // turned of for now as don't want to pass api limts
            function initialize() {
              // Search for Google's office in Australia.
              const request = {
                location: { lat: destination[1], lng: destination[0] },
                radius: "1",
              };
              // source: https://stackoverflow.com/questions/14343965/google-places-library-without-map
              const service = new google.maps.places.PlacesService(
                document.createElement("div")
              );
              service.nearbySearch(request, callback);
            }

            // Checks that the PlacesServiceStatus is OK, and adds a marker
            // using the place ID and location from the PlacesService.
            // source: https://developers.google.com/maps/documentation/javascript/places#find_place_requests
            function callback(results, status) {
              console.log(results);
              results.map((place) => {
                if (place.photos) {
                  place.photos[0] = place.photos[0].getUrl();
                }
              });
              document.querySelector(".destination__img").src =
                results[0].photos[0] || results[1].photos[0];

              if (results[0].photos[0]) {
                generateCustomMarker(
                  map,
                  waterSource._data.geometry.coordinates,
                  results[0].photos[0]
                );
              } else {
                generateCustomMarker(
                  map,
                  waterSource._data.geometry.coordinates,
                  results[1].photos[0]
                );
              }
            }
            generateCustomMarker(
              map,
              waterSource._data.geometry.coordinates,
              "https://www.loudounwater.org/sites/default/files/source%20water_19273373_LARGE.jpg"
            );

            // initialize()

            config.chapters.forEach((chapter) => {
              console.log(
                "chapter id: ",
                chapter.id,
                "location: ",
                chapter.location.center
              );

              if (chapter.id === "theRoute") {
                chapter.location.center = middleOfRoute;
                console.log("chapter theRoute: ", chapter);
              }

              if (chapter.id === "randomEvent") {
                chapter.location.center = middleOfRoute;
                chapter.time = (completeDuration / 2) * 3;
                console.log("chapter randomEvent: ", chapter);
              }

              if (chapter.id === "arrival") {
                chapter.location.center = destination;
                chapter.time = (completeDuration / 2) * 4;
              }

              if (chapter.id === "randomSourceEvent") {
                chapter.location.center = destination;
                chapter.time = 30;
              }

              if (chapter.id === "filling_time") {
                chapter.location.center = destination;
                chapter.time = 30;
              }

              if (chapter.id === "physical_stress") {
                chapter.location.center = middleOfRoute;
                chapter.time = completeDuration / 2;
              }

              if (chapter.id === "back_home") {
                chapter.location.center = coordinates;
                chapter.time = completeDuration / 2;
              }
            });

            map
              .getSource("half-way")
              .setData({ type: "Point", coordinates: middleOfRoute });
            map
              .getSource("arrived")
              .setData({ type: "Point", coordinates: destination });
          });
      });

    // set center option for all chapters, as it will be the same for each

    config.chapters.forEach((chapter) => {
      if (chapter.id === "your-home") {
        chapter.location.center = coordinates;
      }

      if (chapter.id === "explanation") {
        chapter.location.center = coordinates;
      }

      if (chapter.id === "theRadius") {
        chapter.location.center = coordinates;
      }

      if (chapter.id === "theWaterSource") {
        chapter.location.center = coordinates;
      }

      if (chapter.id === "startPoint") {
        chapter.location.center = coordinates;
      }
    });

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
  const el = document.createElement("div");
  const arrowDown = document.createElement("div");
  const waterSourceImg = new Image();

  waterSourceImg.src = imageSource;
  waterSourceImg.classList.add("water-source__img");
  arrowDown.classList.add("arrow-down");
  el.classList.add("water-source__container");

  el.appendChild(waterSourceImg);

  el.className = "marker";

  console.log("hahaha", coordinates);

  map.on("click", (e) => {
    console.log("just clicked long and lat: ", e.lngLat);

    const diff = (a, b) => {
      return Math.abs(a - b);
    };

    console.log("difference long: ", diff(coordinates[0], e.lngLat.lng));
    console.log("difference lat: ", diff(coordinates[1], e.lngLat.lat));
  });

  const diffLong = coordinates[0] + 0.00014974447299209714;
  const diffLat = coordinates[1] + 0.0028258217985239753;
  console.log("hahaha 22222", [diffLong, diffLat]);
  // make a marker for each feature and add to the map
  const marker = new mapboxgl.Marker(el)
    .setLngLat([coordinates[0], diffLat])
    .addTo(map);

  console.log("marker: ", el.style);
}

var backgroundImage = document.querySelector(
  ".introduction__mobile-background"
);

function fadeOutOnScroll(element) {
  if (!element) {
    return;
  }

  var distanceToTop = window.pageYOffset + element.getBoundingClientRect().top;
  var elementHeight = element.offsetHeight;
  var scrollTop = document.documentElement.scrollTop;

  var opacity = 1;

  if (scrollTop > distanceToTop) {
    opacity = 1 - (scrollTop - distanceToTop) / elementHeight;
  }

  if (opacity >= 0) {
    element.style.opacity = opacity;
  }
}

function scrollHandler() {
  fadeOutOnScroll(backgroundImage);
}

const mediaQuery = "(min-width: 750px)";
const mediaQueryList = window.matchMedia(mediaQuery);

if (window.innerWidth < 750) {
  window.addEventListener("scroll", scrollHandler);
}

mediaQueryList.addEventListener("change", (event) => {
  console.log(window.innerWidth);
  if (event.matches) {
    window.removeEventListener("scroll", scrollHandler);
  } else {
    window.addEventListener("scroll", scrollHandler);
    backgroundImage.style.opacity = 1;
  }
});
