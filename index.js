// Check if a map already exists in the container and remove it

document.addEventListener("DOMContentLoaded", function () {
    const cmap = [
        { color: '#0000FF', position: 0.1 },
        { color: '#00FFFF', position: 0.3 },
        { color: '#00FF00', position: 0.5 },
        { color: '#FFFF00', position: 0.7 },
        { color: '#FF0000', position: 0.9 }
    ];

    let map;

    async function generateInteractiveRainfallMap(year, month) {
        const colIndex = (year - 1984) * 12 + (month - 10);

        try {
            const response = await fetch('Rainfall_Data.csv');
            const csvData = await response.text();

            const parsedData = parseCSV(csvData);

            const validData = parsedData.filter(row => !isNaN(row.col_1) && !isNaN(row.col_2) && !isNaN(row['col_' + colIndex]));

            const latitudes = validData.map(row => row.col_1);
            const longitudes = validData.map(row => row.col_2);
            const rainfallValues = validData.map(row => row['col_' + colIndex]);

            const normalizedRainfall = rainfallValues.map(value => (value - Math.min(...rainfallValues)) / (Math.max(...rainfallValues) - Math.min(...rainfallValues)));

            if (!map) {
                map = L.map('map').setView([33.75, -112.125], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
            }

            const heatmapData = latitudes.map((_, index) => [latitudes[index], longitudes[index], normalizedRainfall[index]]);
            
            const gradientArray = cmap.map(colorObj => `${colorObj.position} ${colorObj.color}`);
            const gradientString = gradientArray.join(',');

            const heatmapLayer = L.heatLayer(heatmapData, {
                minOpacity: 0.5,
                radius: 15,
                blur: 10,
                gradient: gradientString,
            }).addTo(map);

            console.log('Interactive rainfall map generated.');
        } catch (error) {
            console.error('Error fetching or parsing CSV data:', error);
        }
    }

    const yearWidget = document.getElementById('year');
    const monthWidget = document.getElementById('month');
    const generateButton = document.getElementById('generate-button');

    generateButton.addEventListener('click', function () {
        const year = parseInt(yearWidget.value, 10);
        const month = parseInt(monthWidget.value, 10);
        generateInteractiveRainfallMap(year, month);
    });

    function parseCSV(csvData) {
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
});
