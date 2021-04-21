mapboxgl.accessToken = 'pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/countnick/ckm36h38ybupk17p6lcl9pie9', // style URL
center: [-74.5, 40], // starting position [lng, lat]
zoom: 1 // starting zoom
});

const searchInput = document.querySelector('#search');
const searchContainer = searchInput.parentElement
const locationButton = document.querySelector('.search__location-button');


locationButton.addEventListener('click', getGeoLocation)

searchInput.addEventListener('input', (e) => {
    // if querystring contains spaces replace this with %20
    let queryString = e.target.value.replace(/\s/g, '%20')
    // geocoding api source: https://docs.mapbox.com/api/search/geocoding/#mapboxplaces
    const fetchedOptions = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?country=nl&access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(data => data);

    chooseAddress(fetchedOptions)
})

async function chooseAddress (data){
    if(document.querySelector('.options__container') !== null) {
        document.querySelector('.options__container').remove()
    }
    const rawData = await data
    const addressOptions = rawData.features
    const optionsContainer = document.createElement('ul')
    optionsContainer.classList.add('options__container')
    
    addressOptions.forEach(option => {
        console.log(option)

        const listItem = document.createElement('li')

        listItem.addEventListener('click', (e) => {
            searchInput.parentElement.parentElement.remove()
            searchInput.value = e.target.innerHTML;
                
            plotHomeLocation(option.geometry.coordinates)
            
        })

        listItem.innerHTML = option.place_name
        optionsContainer.appendChild(listItem)
        
    })
    searchContainer.insertBefore(optionsContainer, locationButton) 
}

function plotHomeLocation(coordinates) {
    // console.log(coordinates)
    // let features = map.queryRenderedFeatures(coordinates);

    // console.log(features)

    const homeMarker = document.createElement('div');
    homeMarker.className = 'home-marker';
    homeMarker.style.backgroundColor = 'black';
    homeMarker.style.width = "20px"
    homeMarker.style.height = "20px"

    const marker = new mapboxgl.Marker(homeMarker)
        .setLngLat(coordinates)
        .addTo(map);


    map.flyTo({
        center: marker._lngLat,
        zoom: 11,
        bearing: 0,
        speed: 1,
        curve: 1,
        easing: (t) => t,
        essential: true
    });

    showRadius(coordinates)

    const tileset = 'countnick.0j3fne09'; // replace this with the ID of the tileset you created
    const radius = 8000; // 1609 meters is roughly equal to one mile
    const limit = 50; // The maximum amount of results to return
    // Tileset api source: https://docs.mapbox.com/help/tutorials/tilequery-healthy-food-finder/
    const query = 'https://api.mapbox.com/v4/' + tileset + '/tilequery/' + coordinates[0] + ',' + coordinates[1] + '.json?radius=' + radius + '&limit= ' + limit + ' &access_token=' + mapboxgl.accessToken;

    fetch(query)
        .then(res => res.json())
        .then(data => {
            console.log('data: ', data)

            const longer = data.features.filter(item => item.properties.tilequery.distance > 1500)

            const random = Math.floor(Math.random() * longer.length);

            console.log(longer[random])

            map.getSource('tilequery').setData(longer[random]);
            
            const waterSource = map.getSource('tilequery')
            // route: geoconverter.hsr.ch
            fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${waterSource._data.geometry.coordinates[0]},${waterSource._data.geometry.coordinates[1]};${marker._lngLat.lng},${marker._lngLat.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
              .then(res => res.json())
              .then(data => {
                console.log(data.routes[0])
                map.getSource('line').setData(data.routes[0].geometry);
              })

        });
}

function getGeoLocation() {
  if (navigator.geolocation) {
    console.log(navigator.geolocation.getCurrentPosition(showPosition))
  } else {
    console.log('not working pall')
  }
}

function showPosition(position) {
    plotHomeLocation([position.coords.longitude, position.coords.latitude])
}

function showRadius(coordinates) {
    console.log(coordinates)
    const center = turf.point(coordinates);
    const radius = 6;
    const options = {
        // steps: 80,
        units: 'kilometers'
    };

    const circle = turf.buffer(center, radius, options);

    map.addLayer({
        "id": "circle-fill",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": circle
        },
        "paint": {
            "fill-color": "pink",
            "fill-opacity": 0.5
        }
    });
    // map.addLayer({
    //     "id": "circle-outline",
    //     "type": "line",
    //     "source": {
    //         "type": "geojson",
    //         "data": circle
    //     },
    //     "paint": {
    //         "line-color": "blue",
    //         "line-opacity": 0.5,
    //         "line-width": 10,
    //         "line-offset": 5
    //     },
    //     "layout": {

    //     }
    // });


}

map.on('load', (e) => {
    map.on('click', function(e) {
        console.log(e.point)
        let features = map.queryRenderedFeatures(e.point);
        console.log(features)
    });

    map.addSource('tilequery', { // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          "type": "FeatureCollection",
          "features": []
        }
      });
      
      map.addLayer({ // Add a new layer to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addlayer
        id: "tilequery-points",
        type: "circle",
        source: "tilequery", // Set the layer source
        paint: {
          "circle-stroke-color": "white",
          "circle-stroke-width": { // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 0.1],
              [18, 3]
            ],
            base: 5
          },
          "circle-radius": { // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180]
            ],
            base: 5
          },
          "circle-color": [ // Specify the color each circle should be
            'match', // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            ['get', 'STORE_TYPE'], // Use the result 'STORE_TYPE' property
            'Convenience Store', '#FF8C00',
            'Convenience Store With Gas', '#FF8C00',
            'Pharmacy', '#FF8C00',
            'Specialty Food Store', '#9ACD32',
            'Small Grocery Store', '#008000',
            'Supercenter', '#008000',
            'Superette', '#008000',
            'Supermarket', '#008000',
            'Warehouse Club Store', '#008000',
            '#FF0000' // any other store type
          ]
        }
      });

      map.addSource('line', { // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: "geojson",
        data: {
          "type": "FeatureCollection",
          "features": []
        }
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
})