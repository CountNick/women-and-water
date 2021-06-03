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
let timer = {
  currentTime: 0,
  totalTime: 0
}; 

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

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);

      map._container.classList.remove("eraseFromDom");

      setTimeout(() => {
        map._container.classList.add("active");
      }, 1000);

      searchInput.parentElement.previousElementSibling.classList.add(
        "eraseFromDom"
      );
      searchInput.parentElement.classList.add("eraseFromDom");

    } else {
      alert("we weren't able to use your location, please fill in your address")
    }
  }
  
  const showPosition = (position) => {
    plotHomeLocation([position.coords.longitude, position.coords.latitude]);
  }

  locationButton.addEventListener("click", getGeoLocation);

  searchInput.addEventListener("input", (e) => {
    // removes the options container from DOM if it's already there
    if (document.querySelector(".options__container") !== null) {
      document.querySelector(".options__container").remove();
    }
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
    // wait for the data
    const rawData = await data;
    // select only the features array
    const addressOptions = rawData.features.slice(0, 5);
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
      <button data-attribute="story__prev-btn" class="story__prev-btn unclickable">
        <span class="material-icons story__prev-icon">
        navigate_before
        </span>
      </button>
      <button class="story__next-btn">
        <span class="material-icons story__next-icon">
        navigate_next
        </span>
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
      document
        .querySelector(".sharePage__container")
        .classList.remove("eraseFromDom");
      document
        .querySelector(".shareImage__container")
        .classList.remove("eraseFromDom");
      shareButton.classList.add("eraseFromDom");

      html2canvas(document.querySelector(".sharePage__container"), {
        allowTaint: true,
        scale: 1,
        windowWidth: 450,
        width: 450,
        windowHeight: 650,
        height: 650,
      }).then((canvas) => {
        // document.body.appendChild(canvas)
        console.log(canvas);

        const downloadButton = document.querySelector(".download__image");
        const loaderContainer = document.querySelector(
          ".loader__container-image"
        );
        const exportImg = canvas.toDataURL("image/png");
        const showImage = new Image();
        showImage.classList.add("shareImage__image");
        showImage.src = exportImg;

        downloadButton.href = exportImg;

        loaderContainer.parentNode.replaceChild(showImage, loaderContainer);

        downloadButton.classList.remove("unclickable");

        function debugBase64(base64URL) {
          var win = window.open();
          win.document.write(
            '<iframe src="' +
              base64URL +
              '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
          );
        }

        downloadButton.addEventListener("click", (e) => {
          // e.preventDefault();
          // debugBase64(exportImg);
        });
      });
    });

    // map.getSource("mark").setData({ type: "Point", coordinates: coordinates });

    map.getSource("mark").setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { image: "./static/img/jerrycan.jpeg" },
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
        },
      ],
    });

    const positionElement = document.createElement("div");
    const jerrycanElement = document.createElement("div");

    console.log(
      "jerrycan image link: ",
      map.getSource("mark")._data.features[0].properties.image
    );

    positionElement.innerText = "This circle displays your position";
    positionElement.className = "position__marker";
    jerrycanElement.className = "jerrycan__marker";

    jerrycanElement.insertAdjacentHTML(
      "afterbegin",
      `
      <div class=jerrycan__container>
      <img class="jerrycan__image" src="${map.getSource("mark")._data.features[0].properties.image}">
      <p>Height: 46 cm</p>
      <p>Width: 32 cm</p>
      </div>
      `
    );

    // make a marker for each feature and add to the map
    const positionMarker = new mapboxgl.Marker(positionElement, {
      offset: [0, -50],
    })
      .setLngLat(coordinates)
      .addTo(map);

    const jerrycanMarker = new mapboxgl.Marker(jerrycanElement, {
      offset: [0, -100],
    })
      .setLngLat(coordinates)
      .addTo(map);

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
              ".randomEvent__time"
            ).textContent = Data.minutesToHours(completeDuration);

            console.log("randomSourceEvent: ", document.querySelector(".randomSourceEvent__time"))

            if(document.querySelector(".randomSourceEvent__time") !== null) {
              document.querySelector(
              ".randomSourceEvent__time"
              ).textContent = Data.minutesToHours(30);
            }

            

            console.log("Line getting filled with: ", data.routes[0].geometry);
            map.getSource("line").setData(data.routes[0].geometry);
            map.getSource("route-outline").setData(data.routes[0].geometry);

            const xRayElement = document.createElement("div")
            xRayElement.className = "x-ray__marker"
            
            xRayElement.insertAdjacentHTML(
              "afterbegin",
              `
              <div class="x-ray__container">
              <img class="x-ray__image" src="./static/img/neck-x-ray.jpeg">
              </div>
              `
            );


            const middleOfRoute =
              data.routes[0].geometry.coordinates[
                Math.floor((data.routes[0].geometry.coordinates.length - 1) / 2)
              ];
            
              const xrayMarker = new mapboxgl.Marker(xRayElement, {
                offset: [0, -100],
              })
                .setLngLat(middleOfRoute)
                .addTo(map);

            const encodedLine = polyline.fromGeoJSON(
              map.getSource("line")._data
            );

            fetch(
              `https://api.mapbox.com/styles/v1/countnick/ckoa0w5zy1t3j18qkn25xwu6i/static/pin-l-home+d7a565(${
                map.getSource("mark")._data.features[0].geometry.coordinates[0]
              },${
                map.getSource("mark")._data.features[0].geometry.coordinates[1]
              }),pin-l-water+d76565(${
                map.getSource("tilequery")._data.geometry.coordinates[0]
              },${
                map.getSource("tilequery")._data.geometry.coordinates[1]
              }),path-5+d7a565(${encodeURIComponent(encodedLine)})/${
                middleOfRoute[0]
              },${
                middleOfRoute[1]
              },11.5,0,0/600x600?access_token=pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw`
            )
              .then((res) => res.blob())
              .then((blob) => {
                const img = URL.createObjectURL(blob);

                let today = new Date();
                const dd = String(today.getDate()).padStart(2, "0");
                const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
                const yyyy = today.getFullYear();

                today = `${mm}/${dd}/${yyyy}`;

                config.chapters.map((chapter) =>
                  console.log("time: ", chapter.time)
                );

                const shareRoutePage = document.createElement("div");
                const shareImage = document.createElement("div");

                shareRoutePage.classList.add("sharePage__container");
                shareRoutePage.classList.add("eraseFromDom");
                shareImage.classList.add("shareImage__container");
                shareImage.classList.add("eraseFromDom");

                shareRoutePage.insertAdjacentHTML(
                  "beforeend",
                  `
                    <div class="sharePage-header__container">
                      <h1 class="sharePage__title">My journey for water</h1>
                      <h2 class="sharePage__subtitle">countnick.github.io/women-and-water/</h1>
                    </div>

                    <div class="sharePage__metadata">
                      <ul class="route-data__list">
                        <li class="metadata__list-item meta__time-legend"><span class="material-icons">
                        timer
                        </span>
                        ${Data.minutesToHours(completeDuration * 2)}</li>
                        <li class="metadata__list-item meta__route-legend"><span class="material-icons">
                        directions
                        </span>
                        ${(data.routes[0].distance / 1000).toFixed(1)}km</li>
                      </ul>
                      <ul class="metadata__list">
                        <li class="metadata__list-item">${today}</li>
                      </ul>
                    </div>

                    <img class="sharePage__image" src=${img} alt="myroute">

                    <p class="sharePage__text">
                        If I would be in the shoes of a women or girl from Niger this is <span class="route__text"><b>the route I'd have to walk to fetch water.</span></b>
                        Because women spend most of their day collecting water they can't go to school, <span class="time__text"><b>which has a direct impact on their social position</b></span>.
                    </p>
                    
                  `
                );

                shareImage.insertAdjacentHTML(
                  "beforeend",
                  `
                    <div class="shareImage-header__container">
                      <h1 class="shareImage__title">Share my route</h1>
                      <button class="shareImage__close-btn" data-html2canvas-ignore >
                        <span class="material-icons">
                          close
                        </span>
                      </button>
                    </div>

                    <div class="shareImage__content">
                      
                      <div class="loader__container-image">
                        <div class="loader"></div>
                      </div>

                      
                        <div class="shareImage__download-section">

                        <a class="download__image unclickable" download="my-journey-for-water.png" href="" data-html2canvas-ignore><span class="material-icons">
                        file_download
                        </span>Save image</a>

                        <div class="download__text">
                        
                          <p class="main__text">
                            This image shows how far you would have to walk for water if you would be in the shoes of a woman or girl in Niger.
                          </p>

                          <p class="sub__text">
                            The route displayed is an approximation.
                          </p>

                        </div>
                      

                    </div>

                    </div>

                  `
                );

                document.querySelector("body").appendChild(shareImage);
                document
                  .querySelector("body")
                  .insertBefore(
                    shareRoutePage,
                    document.querySelector(".introduction__container")
                  );

                const closeButton = document.querySelector(
                  ".shareImage__close-btn"
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
                  document
                    .querySelector(".sharePage__container")
                    .classList.add("eraseFromDom");
                  document
                    .querySelector(".shareImage__container")
                    .classList.add("eraseFromDom");
                  shareButton.classList.remove("eraseFromDom");
                });

                // downloadButton.addEventListener('click', (e) => {
                //   e.preventDefault()

                // })
              });

            const destination =
              data.routes[0].geometry.coordinates[
                data.routes[0].geometry.coordinates.length - 1
              ];

            const half = Math.ceil(
              data.routes[0].geometry.coordinates.length / 2
            );

            const firstHalfCoordinates = data.routes[0].geometry.coordinates.splice(
              0,
              half
            );

            const secondHalfCoordinates = data.routes[0].geometry.coordinates.splice(
              -half
            );

            secondHalfCoordinates.unshift(middleOfRoute);

            // console.log('firstHalfCoordinates', firstHalfCoordinates)
            // console.log('secondHalfCoordinates', secondHalfCoordinates)
            // secondHalfCoordinates.map(cord => console.log(cord))
            // console.log('middleOfRoute', middleOfRoute)

            map.getSource("first-half").setData({
              coordinates: firstHalfCoordinates,
              type: "LineString",
            });
            map.getSource("second-half").setData({
              coordinates: secondHalfCoordinates,
              type: "LineString",
            });
            // map.getSource("first-half-back").setData({coordinates: secondHalfCoordinates.splice(1), type: "LineString"});

            // turned of for now as don't want to pass api limts
            function initializeGoogleMapsAPI() {
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

              // document.querySelector(".destination__img").src =
              //   results[0].photos[0] || results[1].photos[0];

              if (results[0].hasOwnProperty("photos")) {
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

            // initializeGoogleMapsAPI()

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
                timer.totalTime = timer.totalTime + chapter.time
              }

              if (chapter.id === "arrival") {
                chapter.location.center = destination;
                chapter.time = (completeDuration / 2) * 4;
                timer.totalTime = timer.totalTime + chapter.time
              }

              if (chapter.id === "randomSourceEvent") {
                chapter.location.center = destination;
                chapter.time = 30;
                timer.totalTime = timer.totalTime + chapter.time
              }

              if (chapter.id === "filling_time") {
                chapter.location.center = destination;
                chapter.time = 30;
                timer.totalTime = timer.totalTime + chapter.time
              }

              if (chapter.id === "physical_stress") {
                chapter.location.center = middleOfRoute;
                chapter.time = completeDuration / 2;
                timer.totalTime = timer.totalTime + chapter.time
              }

              if (chapter.id === "back_home") {
                chapter.location.center = coordinates;
                chapter.time = completeDuration / 2;
                timer.totalTime = timer.totalTime + chapter.time
              }
            });

            document.querySelector(
              ".total__hours"
            ).textContent = Data.minutesToHours(timer.totalTime);

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
      // console.log('QuerySelector: ', [...document.querySelector('#features').children])
      // console.log('e.target: ', e.target.parentElement.nextElementSibling.children)
      const children = [...document.querySelector("#features").children];
      Story.update(children, e, config, map, setLayerOpacity, date, timer);
    });

    storyElement.children[1].addEventListener("click", (e) => {
      // console.log('QuerySelector: ', document.querySelector('#features').children)
      // console.log('e.target: ', e.target.parentElement.nextElementSibling.children)
      // function could look like this: updateStory(event, operator, method)
      const children = [...document.querySelector("#features").children];
      Story.update(children, e, config, map, setLayerOpacity, date, timer);
    });
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
  const waterSourceImg = new Image();

  waterSourceImg.src = imageSource;
  waterSourceImg.classList.add("water-source__img");
  el.classList.add("water-source__container");

  el.appendChild(waterSourceImg);

  el.className = "water-source__marker";

  // make a marker for each feature and add to the map
  const marker = new mapboxgl.Marker(el, {
    offset: [10, -100],
  })
    .setLngLat(coordinates)
    .addTo(map);
}

const backgroundImage = document.querySelector(
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

// if (window.innerWidth < 750) {
//   window.addEventListener("scroll", scrollHandler);
// }

// mediaQueryList.addEventListener("change", (event) => {
//   console.log(window.innerWidth);
//   if (event.matches) {
//     window.removeEventListener("scroll", scrollHandler);
//   } else {
window.addEventListener("scroll", scrollHandler);
backgroundImage.style.opacity = 1;
//   }
// });
