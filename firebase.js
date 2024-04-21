// Get a reference to the Firestore database
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLzPejFjPm5tWUB8Rf429C1b_rrPabP9M",
  authDomain: "wdwaittimes.firebaseapp.com",
  projectId: "wdwaittimes",
  storageBucket: "wdwaittimes.appspot.com",
  messagingSenderId: "853511481873",
  appId: "1:853511481873:web:557681e3e8d86b7e675fb0",
  measurementId: "G-7Z7V0NVR86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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

function fetchData() {
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
            const filteredAttractions = allAttractionsData.filter(item => attractionNames.includes(item.name));
            
            // Call storeData function with filteredAttractions data
            storeData(filteredAttractions);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to store data in Firestore
function storeData(filteredAttractions) {
    filteredAttractions.forEach(attractionData => {
        // Add attraction data to Firestore
        addDoc(collection(db, "attractions"), {
            name: attractionData.name,
            waitTime: attractionData.waitTime,
            status: attractionData.status,
            park: attractionData.park,
            lastUpdate: new Date(attractionData.lastUpdate)
        })
        .then(docRef => {
            console.log("Attraction data added with ID: ", docRef.id);
        })
        .catch(error => {
            console.error("Error adding attraction data: ", error);
        });
    });
}

// Call fetchData to start fetching data and storing it in Firestore
// Set interval to refresh data and update Firebase database every 10 minutes (600,000 milliseconds)
const refreshInterval = 600000; // 10 minutes

// Function to periodically fetch data and update Firebase database
function updateFirebaseData() {
    // Get current date and time
    const now = new Date();
    // Check if current time is within park hours (9am to 9pm)
    if (now.getHours() >= 8 && now.getHours() < 10) {
        // Call fetchData function to fetch data
        fetchData()
            .then(filteredAttractions => {
                // Call storeData function to store data in Firebase
                storeData(filteredAttractions);
            })
            .catch(error => {
                console.error('Error updating Firebase data:', error);
            });
    } else {
        console.log('Park is closed. Skipping update.'); // Optional: Log a message if the park is closed
    }
}

// Initial call to updateFirebaseData to start the process
updateFirebaseData();

// Set interval to periodically call updateFirebaseData function
setInterval(updateFirebaseData, refreshInterval);
