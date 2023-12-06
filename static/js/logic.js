let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// --------------------------------
// colour selector function
// --------------------------------
function chooseColour(depth){
    if (depth > 90){
        return "red"
    }
    else if (depth > 70){
        return "orangered"
    }
    else if (depth > 60){
        return "orange"
    }
    else if (depth > 30){
        return "gold"
    }
    else if (depth > 10){
        return "yellow"
    }
    else return "lightgreen"
} 


function chooseRadius(magnitude){
    return magnitude * 50000;
} 

// --------------------------------
// features function
// --------------------------------

function createFeatures(earthquakeData) {
    let earthQuakeFeatures = earthquakeData.features;
    let earthquakeMarkers = [];

    for (let i = 0; i < earthQuakeFeatures.length; i++) {
        let thisEQ = earthQuakeFeatures[i];

        earthquakeMarkers.push(
            L.circle([thisEQ.geometry.coordinates[1], thisEQ.geometry.coordinates[0]], {
                fillOpacity: 0.5,
                color: "white",
                fillColor: chooseColour(thisEQ.geometry.coordinates[2]),
                radius: chooseRadius(thisEQ.properties.mag)
            }).bindPopup(`<h3>Location: ${thisEQ.properties.place}</h3><hr><p>DateTime: ${new Date(thisEQ.properties.time)}</p><p>Magnitude: ${thisEQ.properties.mag}</p><p>Depth: ${thisEQ.geometry.coordinates[2]}</p>`)
        );
    }

    // create a layer group using the marker data
    return L.layerGroup(earthquakeMarkers);
}




// --------------------------------
// Map function
// --------------------------------

function createMap(earthquakes) {
    // Satellite Map
    let satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
    });
    
    // Grayscale Map
    let grayscale = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    // Outdoors Map
    let outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
        maxZoom: 22
    });
        // baseMaps object to hold the streetmap layer.
        let baseMaps = {
            "Satellite": satellite,
            "Grayscale": grayscale,
            "Outdoors": outdoors
        };
    
        // Create an overlayMaps object to hold the earthquakes layer.
        let overlayMaps = {
            "Earthquakes": earthquakes
        };
    
        // Create the map object with options.
        let myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [satellite, earthquakes] 
        });
    
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    } 


// --------------------------------
// Legend function
// --------------------------------

function addLegend(map) {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 60, 70, 90]; // Adjust these values based on your depth ranges

        // Loop through depth ranges and generate a label with a colored square for each
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColour(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Add the legend to the map
    legend.addTo(map);
}


// --------------------------------
// access the data
// --------------------------------
d3.json(url).then(function (response) {
    let earthquakes = createFeatures(response);

    // Create the map and get a reference to it
    let map = createMap(earthquakes);

    // Add the legend to the map
    addLegend(map);
});