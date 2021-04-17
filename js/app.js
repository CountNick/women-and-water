mapboxgl.accessToken = 'pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/countnick/ckn8xl8wv1w4117qx5v0xm3oq', // style URL
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

    const fetchedOptions = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?access_token=${mapboxgl.accessToken}`)
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

    console.log(map.queryRenderedFeatures(marker._lngLat));

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
      steps: 80,
      units: 'kilometers'
    };

    const circle = turf.circle(center, radius, options);
    console.log('circle: ', circle)
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
    map.addLayer({
        "id": "circle-outline",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": circle
        },
        "paint": {
            "line-color": "blue",
            "line-opacity": 0.5,
            "line-width": 10,
            "line-offset": 5
        },
        "layout": {

        }
    });

    // console.log('circle: ', circle)

    // const featureList = circle.geometry.coordinates[0].map(point => {
    //     // console.log(point)
    //     let features = map.queryRenderedFeatures(point);
    //     // console.log(features)
    //     return features.filter(feature => feature.layer.id === 'water')

    // })

    // console.log(featureList, featureList.length)
    
}

map.on('load', (e) => {
    map.on('click', function(e) {
        console.log(e.point)
        let features = map.queryRenderedFeatures(e.point);
        console.log(features)
    })
})