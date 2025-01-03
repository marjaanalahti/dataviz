mapboxgl.accessToken = 'pk.eyJ1Ijoicm94eW9uZSIsImEiOiJjbTM3aDlrd2wwOXNnMm5yMTJ4aW1wemRoIn0.qrzg70r0yeeYhrtyL7ITOA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/roxyone/cm4ibojuj002b01s9ff7g02ve',
    center: [24.945831, 60.192059],
    zoom: 12,
    pitch: 60
});

let currentMetric = 'average_rating'; 

map.on('load', async function () {
    const geojsonPath = '/data/Merged_Blocks_clean.geojson';
    const geojsonData = await fetchGeoJSON(geojsonPath);

    map.addSource('blocks', {
        type: 'geojson',
        data: geojsonData
    });

    map.addLayer({
        id: 'ratings-layer',
        type: 'fill',
        source: 'blocks',
        paint: getLayerPaintConfig(currentMetric)
    });

    map.on('click', 'ratings-layer', (e) => {
        const block = e.features[0];
        const blockInfo = block.properties;
        updateSidebar(blockInfo, currentMetric);
    });

    initializeUIComponents(currentMetric);
});

async function fetchGeoJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
        console.error('Failed to load GeoJSON:', response.statusText);
        return null;
    }
    return await response.json();
}

function getLayerPaintConfig(metric) {
    if (metric === 'average_rating') {
        return {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'average_rating']],
                0, 'rgba(255, 230, 240, 0.4)',
                1, 'rgba(251, 206, 221, 0.8)',
                2, 'rgba(247, 182, 203, 1)',
                3, 'rgba(243, 157, 184, 1)',
                4, 'rgba(239, 132, 165, 1)',
                4.2, 'rgba(235, 108, 147, 1)',
                4.4, 'rgba(231, 83, 128, 1)',
                4.6, 'rgba(215, 62, 113, 1)',
                4.8, 'rgba(161, 21, 75, 1)',
                5, 'rgba(87, 0, 45, 1)'
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': '#ffffff'
        };
    } else {
        return {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'fastest_time']],
                0, 'rgb(255, 255, 193)',
                3, 'rgb(227, 186, 139)',
                5, 'rgb(239, 141, 125)',
                7, 'rgb(250, 118, 147)',
                10, 'rgb(238, 88, 141)',
                15, 'rgb(180, 72, 118)',
                20, 'rgb(138, 47, 99)',
                25, 'rgb(148, 61, 163)',
                30, 'rgb(102, 38, 150)',
                35, 'rgb(34, 1, 100)'
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': '#ffffff'
        };
    }
}

function updateSidebar(blockInfo, metric) {
    const sidebar = document.getElementById('listings');
    sidebar.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = metric === 'average_rating' ? 'Average rating of the businesses in a block' : 'Fastest time from a block to a highly rated cafe';
    sidebar.appendChild(title);

    const value = blockInfo[metric] !== null
        ? (metric === 'average_rating'
            ? `Block rating: ${blockInfo.average_rating.toFixed(2)}`
            : `Time: ${blockInfo.fastest_time.toFixed(1)} minutes`)
        : `No data available for this block (${metric}).`;

    const valueElement = document.createElement('p');
    valueElement.textContent = value;
    valueElement.className = 'sidebar-content';
    sidebar.appendChild(valueElement);

    if (metric === 'fastest_time' && blockInfo.name) {
        const nameElement = document.createElement('p');
        const ratingsElement = document.createElement('p');
        const typesElement = document.createElement('p');
        nameElement.textContent = `Destination: ${blockInfo.name}`;
        sidebar.appendChild(nameElement);
        ratingsElement.textContent = `Destination rating: ${blockInfo.rating}`;
        sidebar.appendChild(ratingsElement);
        typesArray = JSON.parse(blockInfo.types);
        typesElement.textContent = `Destination types: ${typesArray.join(', ')}`;


        sidebar.appendChild(typesElement);
    
    }

    if (metric === 'average_rating' && blockInfo.businesses) {
        const divider = document.createElement('h2');
        divider.textContent = `businesses`;
        sidebar.appendChild(divider);
        const businesses = JSON.parse(blockInfo.businesses);
        businesses.forEach((business) => {
            const businessElement = document.createElement('div');
            const businessName = document.createElement('span'); 
            businessName.textContent = business.name;
            businessName.style.fontWeight = 'lighter'; 

            const businessRating = document.createElement('span'); 
            const ratingText = business.rating !== null ? `. Rating: ${business.rating.toFixed(2)}` : '';
            businessRating.textContent = ratingText;

            businessElement.appendChild(businessName);
            businessElement.appendChild(businessRating);

            sidebar.appendChild(businessElement);
        });
    }
}

function initializeUIComponents(metric) {
    setupLegend(metric);
    setupToggleButton();
}

function setupLegend(metric) {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    if (metric === 'average_rating') {
        legendContainer.innerHTML = `
            <div class="legend-gradient" style="width: 100%; height: 20px; background: linear-gradient(to right, rgba(255, 230, 240, 0.4),
                rgba(251, 206, 221, 0.8),
                rgba(247, 182, 203, 1),
                rgba(243, 157, 184, 1),
                rgba(239, 132, 165, 1),
                rgba(235, 108, 147, 1),
                rgba(231, 83, 128, 1),
                rgba(215, 62, 113, 1),
                rgba(161, 21, 75, 1),
                rgba(87, 0, 45, 1));"></div>
            <div class="legend-labels" style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>0</span>
                <span>5</span>
            </div>
        `;
    } else {
        legendContainer.innerHTML = `
            <div class="legend-gradient" style="width: 100%; height: 20px; background: linear-gradient(to right, rgb(255, 255, 193),  
                rgb(227, 186, 139),
                rgb(239, 141, 125),
                rgb(250, 118, 147),
                rgb(238, 88, 141),  
                rgb(180, 72, 118),  
                rgb(138, 47, 99),  
                rgb(148, 61, 163),  
                rgb(102, 38, 150),  
                rgb(34, 1, 100));"></div>
            <div class="legend-labels" style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>0</span>
                <span>35</span>
            </div>
        `;
    }
}


function setupToggleButton() {
    const toggleButton = document.getElementById('toggle-button');
    toggleButton.textContent = 'Switch Map View';

    toggleButton.onclick = () => {
        currentMetric = currentMetric === 'average_rating' ? 'fastest_time' : 'average_rating';

        setupLegend(currentMetric);

        map.setPaintProperty('ratings-layer', 'fill-color', getLayerPaintConfig(currentMetric)['fill-color']);

        map.resize();
    };
}