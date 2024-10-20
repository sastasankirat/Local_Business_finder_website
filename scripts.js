document.addEventListener('DOMContentLoaded', () => {
    const businessForm = document.getElementById('business-form');
    const businessCategorySelect = document.getElementById('business-category');
    const otherCategorySection = document.getElementById('other-category-section');
    const addCategoryButton = document.getElementById('add-category');
    const newCategoryInput = document.getElementById('new-category');

    businessCategorySelect.addEventListener('change', () => {
        if (businessCategorySelect.value === 'other') {
            otherCategorySection.style.display = 'block';
        } else {
            otherCategorySection.style.display = 'none';
        }
    });

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

    // Registration button event listener
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
                // Redirect to profile or other page
                window.location.href = '/profile';
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Failed to register business. Please try again later.', 'error');
        }
    });
});

let map;
let service;
let infowindow;
let markers = [];

function initMap() {
    const initialLocation = { lat: 18.5204, lng: 73.8567 }; // Pune, Maharashtra
    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
            // Add custom map styling here if desired
        ]
    });

    service = new google.maps.places.PlacesService(map);

    const input = document.getElementById('location');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    document.getElementById('search-button').addEventListener('click', function () {
        clearMarkers();
        searchBusinesses();
    });

    loadDefaultBusinesses(initialLocation);
}

function loadDefaultBusinesses(location) {
    const request = {
        location: location,
        radius: '5000',
        type: ['store']
    };
    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    });
}

function searchBusinesses() {
    const businessName = document.getElementById('business-name').value;
    const businessCategory = document.getElementById('business-category').value;
    const location = document.getElementById('location').value;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': location }, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            const request = {
                location: results[0].geometry.location,
                radius: '5000',
                keyword: businessName,
                type: businessCategory ? [businessCategory] : []
            };

            service.nearbySearch(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    map.setZoom(14);
                    for (let i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
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

function createMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(
            `<div><strong>${place.name}</strong><br>
            Rating: ${place.rating || 'N/A'}<br>
            <img src="${place.photos ? place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 }) : ''}" alt="Business Image"><br>
            ${place.vicinity}</div>`
        );
        infowindow.open(map, this);
    });
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function clusterMarkers() {
    new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });
}

function showToast(message, type) {
    // Implement a function to show toast notifications
    // type can be 'success', 'error', 'warning'
    console.log(`[${type.toUpperCase()}] ${message}`);
}

window.onload = initMap;
