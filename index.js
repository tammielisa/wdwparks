const baseurl = 'https://api.themeparks.wiki/preview/parks/WaltDisneyWorld';
const attractions = [
    { name: "AnimalKingdom", park: "Animal Kingdom" },
    { name: "MagicKingdom", park: "Magic Kingdom" },
    { name: "Epcot", park: "Epcot" },
    { name: "HollywoodStudios", park: "Hollywood Studios" }
];

const attractionNames = [
    "Avatar Flight of Passage", "Expedition Everest - Legend of the Forbidden Mountain", "DINOSAUR", "Kilimanjaro Safaris", "Jungle Cruise", "Seven Dwarfs Mine Train", "Big Thunder Mountain Railroad", "Mad Tea Party", "Peter Pan's Flight", "Pirates of the Caribbean", "Space Mountain", "Haunted Mansion", "Frozen Ever After", "Remy's Ratatouille Adventure", "Spaceship Earth", "Test Track", "Star Wars: Rise of the Resistance", "Toy Story Mania!", "The Twilight Zone Tower of Terror™"
];

// Mapping between original names and display names
const attractionNameMapping = {
    "Expedition Everest - Legend of the Forbidden Mountain": "Expedition Everest",
    // Add more mappings as needed
};

// Function to get the display name for an attraction
function getDisplayName(attractionName) {
    return attractionNameMapping[attractionName] || attractionName;
}

function fetchDataAndPopulateTable() {
    const fetchPromises = attractions.map(attraction => {
        const url = `${baseurl}${attraction.name}/waittime`;
        return fetch(url).then(response => response.json())
            .then(data => {
                // Add the park information to each attraction
                data.forEach(attractionData => {
                    attractionData.park = attraction.park;
                });
                return data;
            });
    });

    Promise.all(fetchPromises)
        .then(responses => {
            // Combine responses for all attractions into one array
            const allAttractionsData = responses.flat();
            // Filter data for specific attraction names
            const filteredAttractions = allAttractionsData.filter(item => attractionNames .includes(item.name));
            // Clear the table before populating it with new data
            const tableBody = document.getElementById('apiDataTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear the table body

            // Process filtered data and populate table
            filteredAttractions.forEach(item => {
                const row = tableBody.insertRow();
                row.insertCell(0).innerText = getDisplayName(item.name); // Display modified name
                row.insertCell(1).innerText = item.park; // Display park
                row.insertCell(2).innerText = item.waitTime; // Display wait time
                row.insertCell(3).innerText = item.status;
                
                // Format lastUpdate field
                const lastUpdateDate = new Date(item.lastUpdate);
                const formattedLastUpdate = lastUpdateDate.toLocaleString(); 
                row.insertCell(4).innerText = formattedLastUpdate;
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
// Fetch data and populate table initially
fetchDataAndPopulateTable();


// Set interval to refresh data and populate table every 5 minutes (300,000 milliseconds)
const refreshInterval = 600000; // 10 minutes
setInterval(fetchDataAndPopulateTable, refreshInterval);
// Refresh the page after 10 minutes (600,000 milliseconds)
setTimeout(function() {
    location.reload();
}, 600000);

