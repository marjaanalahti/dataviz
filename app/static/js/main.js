mapboxgl.accessToken = 'pk.eyJ1Ijoicm94eW9uZSIsImEiOiJjbTM3aDlrd2wwOXNnMm5yMTJ4aW1wemRoIn0.qrzg70r0yeeYhrtyL7ITOA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/roxyone/cm4ibojuj002b01s9ff7g02ve',
    center: [24.945831, 60.192059],
    zoom: 15,
    pitch: 60,
    bearing: 0
});

map.on('load', async function () {
    await loadRatingsData();

    map.on('click', 'ratings-layer', (e) => handleBlockClick(e));

    setupLegend();
});

async function loadRatingsData() {
    const filePath = 'data/blocks_with_ratings_and_businesses.geojson';

    const response = await fetch(filePath);
    const blockData = await response.json();

    if (map.getSource('blocks')) {
        map.getSource('blocks').setData(blockData);
    } else {
        map.addSource('blocks', {
            'type': 'geojson',
            'data': blockData
        });
    }

    if (!map.getLayer('ratings-layer')) {
        addRatingsLayer();
    }
}

function addRatingsLayer() {
    map.addLayer({
        'id': 'ratings-layer',
        'type': 'fill',
        'source': 'blocks',
        'paint': {
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
            'fill-opacity': ['case', ['has', 'average_rating'], 1, 0],
            'fill-outline-color': '#ffffff'
        }
    });
}

function handleBlockClick(e) {
    const block = e.features[0];
    const blockInfo = block.properties;
    updateSidebar(blockInfo);
}

function updateSidebar(blockInfo) {
    const sidebar = document.getElementById('listings');
    sidebar.innerHTML = '';

    if (!blockInfo.average_rating) {
        sidebar.textContent = 'No ratings available for this block.';
        return;
    }

    const title = document.createElement('h2');
    title.textContent = 'Average Ratings';
    sidebar.appendChild(title);

    const rating = document.createElement('p');
    rating.textContent = `Average Rating: ${blockInfo.average_rating.toFixed(2)}`;
    sidebar.appendChild(rating);

    const businessList = document.createElement('ul');
    const businesses = JSON.parse(blockInfo.businesses);

    businesses.forEach((business) => {
        const item = document.createElement('li');
        const rating = business.rating !== null ? business.rating.toFixed(2) : '';
        item.textContent = `${business.name} ${rating ? `Rating: ${rating}` : ''}`;
        businessList.appendChild(item);
    });

    sidebar.appendChild(businessList);
}

function setupLegend() {
    const legend = document.createElement('div');
    legend.id = 'legend';
    legend.innerHTML = `
        <div class="legend-title">Average Ratings</div>
        <div class="legend-gradient" style="background: linear-gradient(to right, rgba(255, 230, 240, 0.4), rgba(87, 0, 45, 1));"></div>
        <div class="legend-labels">
            <span>0</span>
            <span>5</span>
        </div>
    `;
    document.body.appendChild(legend);
}
