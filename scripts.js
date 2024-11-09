document.addEventListener('DOMContentLoaded', () => {
    const businessForm = document.getElementById('business-form');
    const businessCategorySelect = document.getElementById('business-category');
    const otherCategorySection = document.getElementById('other-category-section');
    const addCategoryButton = document.getElementById('add-category');
    const newCategoryInput = document.getElementById('new-category');

    // Show/hide 'other' category input field
    businessCategorySelect.addEventListener('change', () => {
        otherCategorySection.style.display = businessCategorySelect.value === 'other' ? 'block' : 'none';
    });

    // Add new category
    addCategoryButton.addEventListener('click', async () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory) {
            try {
                const response = await fetch('/api/add-category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newCategory }),
                });
                const result = await response.json();

                if (result.success) {
                    const option = document.createElement('option');
                    option.value = newCategory;
                    option.textContent = newCategory;
                    businessCategorySelect.appendChild(option);
                    businessCategorySelect.value = newCategory;
                    otherCategorySection.style.display = 'none';
                    newCategoryInput.value = '';
                    showToast(result.message, 'success');
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                showToast('Failed to add category. Please try again later.', 'error');
            }
        } else {
            showToast('Please enter a category name.', 'warning');
        }
    });

    // Register new business
    const registerButton = document.getElementById('register-button');
    registerButton.addEventListener('click', async () => {
        const formData = new FormData(businessForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/register-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.success) {
                showToast('Registration successful!', 'success');
                window.location.href = '/profile';
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Failed to register business. Please try again later.', 'error');
        }
    });
});

let map, service, infowindow, markers = [];

// Initialize Google Map
function initMap() {
    const initialLocation = { lat: 18.5204, lng: 73.8567 }; // Pune, Maharashtra
    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true
    });

    service = new google.maps.places.PlacesService(map);

    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('location'));
    autocomplete.bindTo('bounds', map);

    document.getElementById('search-button').addEventListener('click', () => {
        clearMarkers();
        searchBusinesses();
    });

    loadDefaultBusinesses(initialLocation);
}

// Load default businesses on map
function loadDefaultBusinesses(location) {
    const request = {
        location: location,
        radius: '5000',
        type: ['store']
    };
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(result => createMarker(result));
        }
    });
}

// Search businesses by name, category, and location
function searchBusinesses() {
    const businessName = document.getElementById('business-name').value;
    const businessCategory = document.getElementById('business-category').value;
    const location = document.getElementById('location').value;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': location }, (results, status) => {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            // Create search request for Google Places API
            const request = {
                location: results[0].geometry.location,
                radius: '5000',
                keyword: businessName, // Search by business name
                type: businessCategory ? [businessCategory] : [] // Search by category
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach(result => createMarker(result));
                    clusterMarkers();
                } else {
                    showToast('No businesses found.', 'warning');
                }
            });
        } else {
            showToast('Location not found: ' + status, 'error');
        }
    });
}

// Create a marker on the map
function createMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(`
            <div>
                <strong>${place.name}</strong><br>
                Rating: ${place.rating || 'N/A'}<br>
                <img src="${place.photos ? place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 }) : ''}" alt="Business Image"><br>
                ${place.vicinity}
            </div>
        `);
        infowindow.open(map, marker);
    });
}

// Clear all markers on the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Cluster markers if too many are close together
function clusterMarkers() {
    new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });
}

// Show toast notifications
function showToast(message, type) {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

window.onload = initMap;
