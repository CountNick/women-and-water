
mapboxgl.accessToken = config.accessToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: config.style, // style URL
center: [9, 17], // starting position [lng, lat]
zoom: 2, // starting zoom
scrollZoom: false,
interactive: false
});

const layerTypes = {
    'fill': ['fill-opacity'],
    'line': ['line-opacity'],
    'circle': ['circle-opacity', 'circle-stroke-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'],
    'raster': ['raster-opacity'],
    'fill-extrusion': ['fill-extrusion-opacity']
}

const searchInput = document.querySelector('#search');
const searchContainer = searchInput.parentElement
const locationButton = document.querySelector('.search__location-button');

var features = document.createElement('div');
features.setAttribute('id', 'features');

config.chapters.forEach((record, idx) => {
    /* These first two variables will hold each vignette, the chapter
    element will go in the container element */
    var container = document.createElement('div');
    var chapter = document.createElement('div');
    // Creates the title for the vignettes
    if (record.title) {
        var title = document.createElement('h3');
        title.innerText = record.title;
        chapter.appendChild(title);
    }
    // Creates the image for the vignette
    if (record.image) {
        var image = new Image();
        image.src = record.image;
        chapter.appendChild(image);
    }
    // Creates the image credit for the vignette
    if (record.imageCredit) {
        var imageCredit = document.createElement('p');
        imageCredit.classList.add('imageCredit');
        imageCredit.innerHTML = 'Image credit: ' + record.imageCredit;
        chapter.appendChild(imageCredit);
    }
    // Creates the description for the vignette
    if (record.description) {
        var story = document.createElement('p');
        story.innerHTML = record.description;
        chapter.appendChild(story);
    }
    // Sets the id for the vignette and adds the step css attribute
    container.setAttribute('id', record.id);
    container.classList.add('step');
    if (idx === 0) {
        container.classList.add('active');
    } else {
        container.classList.add('eraseFromDom')
    }
    // Sets the overall theme to the chapter element
    chapter.classList.add(config.theme);
    /* Appends the chapter to the container element and the container
    element to the features element */
    container.appendChild(chapter);
    features.appendChild(container);
});

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
    console.log(coordinates)

    config.chapters[0].location.center = coordinates
    console.log(config)

    // let features = map.queryRenderedFeatures(coordinates);

    // console.log(features)

    const storyElement = document.createElement('div');
    storyElement.className = "story__container"

    storyElement.insertAdjacentHTML('afterbegin', `<button class="story__prev-btn">Previous</button> <button class="story__next-btn">Next</button> `)

    storyElement.appendChild(features)




    document.querySelector('body').appendChild(storyElement)

    

    const homeMarker = document.createElement('div');
    homeMarker.className = 'home-marker';
    homeMarker.style.backgroundColor = 'black';
    homeMarker.style.width = "20px"
    homeMarker.style.height = "20px"

    const marker = new mapboxgl.Marker(homeMarker)
        .setLngLat(coordinates)
        .addTo(map);

    // console.log(map.queryRenderedFeatures(coordinates));

    config.chapters[0].location.center = marker._lngLat
    config.chapters[1].location.center = marker._lngLat
    config.chapters[2].location.center = marker._lngLat

    map.flyTo({
        center: marker._lngLat,
        zoom: 17,
        bearing: 0,
        speed: 1,
        curve: 1,
        easing: (t) => t,
        essential: true
    });

    storyElement.children[1].addEventListener('click', (e) => {

        // function could look like this: updateStory(event, operator, method)

        const children = [...e.target.nextElementSibling.children]
        
        const currentChapterElement = children.find(child => child.classList.contains('active'))
        const currentChapterObject = config.chapters.find(chap => chap.id === currentChapterElement.id)

        // currentChapterElement.classList.remove('active')
        
        // const currentObject = config.chapters.find(chap => currentChapterElement.id === chap.id)

        const findCurrentObject = (obj) => obj.id === currentChapterElement.id
        
        let currInd = config.chapters.findIndex(findCurrentObject)
        
        const nextChapter = config.chapters[++currInd]

        console.log(nextChapter)

        const nextChapterElement = children.find(child => child.id === nextChapter.id)
        
        // nextChapterElement.classList.remove('eraseFromDom')

        currentChapterElement.classList.remove('active')
        // currentChapterElement.classList.add('eraseFromDom')

        currentChapterElement.addEventListener('transitionend', (e) => {
            currentChapterElement.classList.add('eraseFromDom')
            nextChapterElement.classList.remove('eraseFromDom')
            nextChapterElement.classList.add('active')
            if(currentChapterObject.onChapterExit.length > 0) {
                currentChapterObject.onChapterExit.forEach(setLayerOpacity);
            }
        })

        map.flyTo(nextChapter.location);

        if (nextChapter.onChapterEnter.length > 0) {
            nextChapter.onChapterEnter.forEach(setLayerOpacity);
        } else {
            console.log(e)
        }
        
    })

    // map.flyTo({
    //     center: marker._lngLat,
    //     zoom: 17,
    //     bearing: 0,
    //     speed: 1,
    //     curve: 1,
    //     easing: (t) => t,
    //     essential: true
    // });

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
    const center = turf.point(coordinates);
    const radius = 6;
    const options = {
      steps: 80,
      units: 'kilometers'
    };

    const circle = turf.circle(center, radius, options);

    map.addLayer({
        "id": "circle-fill",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": circle
        },
        "opacity": 0,
        "paint": {
            "fill-color": "pink",
            "fill-opacity": 0
        }
    });
    map.addLayer({
        "id": "circle-outline",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": circle
        },
        "opacity": 0,
        "paint": {
            "line-color": "blue",
            "line-opacity": 0,
            "line-width": 10,
            "line-offset": 5
        },
        "layout": {

        }
    });

    // console.log('circle: ', circle.geometry.coordinates[0])

    // const featureList = circle.geometry.coordinates[0].map(point => {
    //     // console.log(point)
    //     let features = map.queryRenderedFeatures(point);
    //     // console.log(features)
    //     return features.filter(feature => feature.layer.id === 'water')

    // })

    // console.log(featureList, featureList.length)
    
}

function getLayerPaintType(layer) {
    console.log('layer: ', layer)
    var layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
}
function setLayerOpacity(layer) {
    var paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function (prop) {
        map.setPaintProperty(layer.layer, prop, layer.opacity);
    });
}

function handleIntersection(entries) {
    entries.map((entry) => {
      if (entry.isIntersecting) {
        // entry.target.classList.add('visible')
        console.log(entry)
      } else {
        // entry.target.classList.remove('visible')
        console.log(entry)
      }
    });
  }

function updateStory(event, operator, method) {
    
}