// Load Leaflet.js library (install using 'npm install leaflet')
const L = require('leaflet');

// Define a custom colormap
const colors = ['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'];
const cmap = colors;

// Function to generate the interactive rainfall map
async function generateInteractiveRainfallMap(year, month) {
    const colIndex = (year - 1984) * 12 + (month - 10);

    try {
        // Fetch CSV data from the local server
        const response = await fetch('Rainfall_Data.csv');
        const csvData = await response.text();

        // Parse CSV data into a JavaScript object
        const parsedData = parseCSV(csvData);

        // Filter rows with non-NaN values
        const validData = parsedData.filter(row => !isNaN(row.col_1) && !isNaN(row.col_2) && !isNaN(row['col_' + colIndex]));

        // Extract latitude, longitude, and rainfall data
        const latitudes = validData.map(row => row.col_1);
        const longitudes = validData.map(row => row.col_2);
        const rainfallValues = validData.map(row => row['col_' + colIndex]);

        // Normalize rainfall values to the range [0, 1] for colormap
        const normalizedRainfall = rainfallValues.map(value => (value - Math.min(...rainfallValues)) / (Math.max(...rainfallValues) - Math.min(...rainfallValues)));

        // Create a map centered around Maricopa District
        const map = L.map('map').setView([33.75, -112.125], 10);

        // Create a HeatMap layer with the normalized rainfall data and custom colormap
        const heatmapData = latitudes.map((_, index) => [latitudes[index], longitudes[index], normalizedRainfall[index]]);
        const heatmapLayer = L.heatLayer(heatmapData, {
            minOpacity: 0.5,
            radius: 15,
            blur: 10,
            gradient: cmap.join(','),
        }).addTo(map);

        // Create a colorbar legend using HTML
        const colorbarHtml = `
            <div id="colorbar" style="position: fixed; bottom: 10px; left: 10px; background-color: rgba(255, 255, 255, 0.8);
                        z-index: 1000; border-radius: 5px; border: 1px solid #999; padding: 5px;">
                <!-- Add your colorbar HTML content here -->
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', colorbarHtml);

        console.log('Interactive rainfall map generated.');
    } catch (error) {
        console.error('Error fetching or parsing CSV data:', error);
    }
}

// Create interactive widgets (replace with your actual HTML elements)
const yearWidget = document.getElementById('year');
const monthWidget = document.getElementById('month');
const generateButton = document.getElementById('generate-button');

// Button click event handler
generateButton.addEventListener('click', function () {
    const year = parseInt(yearWidget.value, 10);
    const month = parseInt(monthWidget.value, 10);
    generateInteractiveRainfallMap(year, month);
});

// Load Leaflet.js map
const map = L.map('map').setView([33.75, -112.125], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Replace with your actual CSV parsing logic
function parseCSV(csvData) {
    // Example: Split CSV data into rows and parse each row into an object
    const rows = csvData.trim().split('\n');
    const header = rows.shift().split(',');
    return rows.map(row => {
        const values = row.split(',');
        const obj = {};
        for (let i = 0; i < header.length; i++) {
            obj[header[i]] = parseFloat(values[i]);
        }
        return obj;
    });
}






