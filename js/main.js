// Initialize the Leaflet map
var map = L.map('map').setView([43.0731, -89.4012], 14);  // Coordinates for Madison, WI

// Add a base tile layer from OpenStreetMap
// Add a base tile layer with a simplified style (Carto Light)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  

// Function to switch tabs
function openTab(event, tabId) {
  const tabContent = event.currentTarget.closest('.popup-tabs').querySelectorAll('.tab-content');
  const tabLinks = event.currentTarget.closest('.tab-buttons').querySelectorAll('.tab-link');

  tabContent.forEach(content => content.classList.remove('active'));
  tabLinks.forEach(link => link.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}


// Fetch the building data from the API
fetch('https://map.wisc.edu/api/v1/buildings')
  .then(response => response.json())
  .then(data => {
    // Convert the API response to GeoJSON format
    const geojsonData = {
      "type": "FeatureCollection",
      "features": data.map(item => ({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [item.latlng[1], item.latlng[0]]  // Longitude, Latitude
        },
        "properties": {
          "name": item.name,
          "address": item.street_address,
          "object_type": item.object_type,
          "departments": item.departments,
          "thumbnail": item.images.thumb
        }
      }))
    };

    // Add the GeoJSON data to the map with popups
    L.geoJSON(geojsonData, {
      onEachFeature: function (feature, layer) {
        // Create custom popup content with Info and Departments tabs
        let popupContent = `
          <div class="popup-tabs">
            <div class="tab-buttons">
              <button onclick="openTab(event, 'info-${feature.properties.name}')" class="tab-link active">Info</button>
              <button onclick="openTab(event, 'departments-${feature.properties.name}')" class="tab-link">Departments</button>
            </div>
            <div id="info-${feature.properties.name}" class="tab-content active">
              <b>Name:</b> ${feature.properties.name}<br>
              <b>Address:</b> ${feature.properties.address}<br>
              <b>Object Type:</b> ${feature.properties.object_type || 'N/A'}<br>
              ${feature.properties.thumbnail 
                ? `<img src="${feature.properties.thumbnail}" alt="${feature.properties.name}" style="width: 100%; max-height: 150px; object-fit: cover; margin-top: 10px;">` 
                : '<i>No image available</i>'}
            </div>
            <div id="departments-${feature.properties.name}" class="tab-content">
              <b>Departments:</b><br>
              ${feature.properties.departments && feature.properties.departments.length > 0
                ? feature.properties.departments.map(dep => `<li>${dep.name}</li>`).join('')
                : 'No departments available'}
            </div>
          </div>
        `;

        // Bind popup with building name, address, and thumbnail if available
        layer.bindPopup(popupContent);
      },
      style: function (feature) {
        return { color: 'blue' };
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Error fetching the building data:', error);
  });