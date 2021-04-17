const config = {    
    accessToken: 'pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw',
    style: 'mapbox://styles/countnick/ckn8xl8wv1w4117qx5v0xm3oq',
    theme: 'dark',
    alignment: 'left',
    toptitle: 'Points Unknown | Tutorial 10 | Mapbox Storytelling',
    title: 'The Geographical Distribution of Subway Usage Decrease Due to COVID-19',
    byline: 'By Juan Francisco Saldarriaga and Michael Krisch',
    description: '<p>This tutorial demonstrates how to use <a href="https://github.com/mapbox/storytelling">Mapbox Storytelling</a> with our previous web mapping example. Here we will use Mapbox storytelling template to first, give an overview of the decrease in subway usage around the city, and second, zoom into three different locations that exemplify the diversity of conditions around New York.</p><p>We will use the <a href="https://pointsunknown.nyc/web%20mapping/mapbox/2020/03/25/10_WebmappingTurnstileData.html">previous web map displaying MTA turnstile data</a> as the basis for our story. In this process we will use Mapbox GL JS, as well as Intersection Observer and Scrollama as our main JavaScript libraries.</p><p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. In harum natus eos cum rem iure aperiam omnis distinctio illo quis, sunt nesciunt sint impedit deleniti dolor saepe necessitatibus eligendi aut?</p><p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. In harum natus eos cum rem iure aperiam omnis distinctio illo quis, sunt nesciunt sint impedit deleniti dolor saepe necessitatibus eligendi aut?</p>',
    footer: 'This story is based on data by the <a href="http://web.mta.info/developers/turnstile.html">Metropolitan Transit Authority</a> and reporting by the New York Times (<a href="https://www.nytimes.com/2020/04/09/nyregion/coronavirus-queens-corona-jackson-heights-elmhurst.html">here</a> and <a href="https://www.nytimes.com/aponline/2020/04/02/us/ap-us-virus-outbreak-hardest-hit.html">here</a>), <a href="https://ny.curbed.com/2020/3/24/21192454/coronavirus-nyc-transportation-subway-citi-bike-covid-19">Curbed</a>, and <a href="https://thecity.nyc/2020/03/subway-ridership-plunge-deepest-at-big-manhattan-stations.html">The City</a>.',
    footerAttribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> | <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a> | <a href="https://brown.columbia.edu">The Brown Institute for Media Innovation</a>',
    chapters: [
        {
            id: 'your-home',
            title: 'No water at home',
            image: 'images/Chapter_1_Image.jpg',
            imageCredit: '<a href="http://www.metouhey.com/">Max Touhey</a>',
            description: `This is where you live, as you don't have any water at home you have to go and fetch this`,
            location: {
                center: [],
                zoom: 10,
                pitch: 0,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'incomeUnderlay',
            title: `The radius you'd have to find water in`,
            image: 'images/Chapter_2_Image.jpg',
            imageCredit: '<a href="https://www.nytimes.com/2020/04/09/nyregion/coronavirus-queens-corona-jackson-heights-elmhurst.html">The New York Times</a>',
            description: 'Girls in Niger have to walk an average of 6km(3.8 miles) a day to get water. This is the radius from your house.',
            location: {
                center: [],
                zoom: 10,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: [
                {
                    layer: 'circle-fill',
                    opacity: 0.5
                }
            ],
            onChapterExit: [
                {
                    layer: 'circle-fill',
                    opacity: 0
                }
            ]
        },
        {
            id: 'elmhurstHospital',
            title: 'The watersource',
            image: 'images/Chapter_3_Image.jpg',
            imageCredit: '<a href="https://www.nytimes.com/2020/04/09/nyregion/coronavirus-queens-corona-jackson-heights-elmhurst.html">The New York Times</a>',
            description: `This is the point you'll have to get water from`,
            location: {
                center: [],
                zoom: 16,
                pitch: 40,
                bearing: -7
            },
            onChapterEnter: [
                {
                    layer: 'medianIncome',
                    opacity: 0
                }
            ],
            onChapterExit: [
                {
                    layer: 'medianIncome',
                    opacity: 0
                }
            ]
        },
        {
            id: 'southBronx',
            title: `The route you'd have to walk`,
            image: 'images/Chapter_4_Image.jpg',
            imageCredit: '<a href="https://www.nytimes.com/2020/04/09/nyregion/coronavirus-queens-corona-jackson-heights-elmhurst.html">The New York Times</a>',
            description: "This is where the route would be plotted",
            location: {
                center: [-73.918037, 40.816093],
                zoom: 15,
                pitch: 40,
                bearing: 8
            },
            onChapterEnter: [
                {
                    layer: 'medianIncome',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                    layer: 'medianIncome',
                    opacity: 0
                }
            ]
        }
    ]
};