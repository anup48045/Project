// Dark mode
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2A7D2E',
        secondary: '#FF9E1F',
        accent: '#8BC34A',
        light: '#F7F9F3',
        dark: '#1A311C',
      }
    }
  }
}

const buyers = [
  { id: 1, name: "Green Grocery Store", address: "Sector 18, Noida", type: "Retailer", produceWanted: ["Organic Tomatoes","Fresh Kale"], distanceKm: 5, avgPrice: 28, lat: 28.570, lng: 77.320 },
  { id: 2, name: "City Fresh Restaurant", address: "Connaught Place, Delhi", type: "Restaurant", produceWanted: ["Cherry Tomatoes","Spinach"], distanceKm: 12, avgPrice: 35, lat: 28.633, lng: 77.220 },
  { id: 3, name: "Farmers Market", address: "Saket, Delhi", type: "Market", produceWanted: ["Apples","Carrots","Potatoes"], distanceKm: 8, avgPrice: 25, lat: 28.527, lng: 77.220 },
  { id: 4, name: "Organic Foods Retail", address: "Gurgaon Sector 29", type: "Retailer", produceWanted: ["Organic Vegetables","Herbs"], distanceKm: 20, avgPrice: 40, lat: 28.460, lng: 77.080 },
  { id: 5, name: "Delhi Kitchen", address: "Rajouri Garden", type: "Restaurant", produceWanted: ["Fresh Vegetables","Spices"], distanceKm: 10, avgPrice: 32, lat: 28.650, lng: 77.120 }
];
let map, userMarker, userLocation = null;
const defaultLocation = [28.6139, 77.2090]; // Delhi
function initMap() {
  map = L.map('mapContainer').setView(defaultLocation, 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  buyers.forEach(b => {
    const icon = L.divIcon({ html: '<div class="bg-primary rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width:36px;height:36px;"><i class="fas fa-store"></i></div>', className: '', iconSize: [36,36], iconAnchor: [18,18] });
    const marker = L.marker([b.lat,b.lng], { icon }).addTo(map);
    marker.bindPopup(`<div class="p-2"><h4 class="font-semibold text-primary">${b.name}</h4><p class="text-sm my-1">${b.address}</p><p class="text-sm my-1">Wants: ${b.produceWanted.join(', ')}</p><p class="text-sm my-1">Avg Price: ₹${b.avgPrice}/kg</p></div>`);
  });
}
function locateUser() {
  const statusEl = document.getElementById('locationStatus');
  statusEl.textContent = "Locating...";
  if (!navigator.geolocation) {
    statusEl.textContent = "Geolocation is not supported by your browser";
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setView([userLocation.lat, userLocation.lng], 13);
    if (userMarker) map.removeLayer(userMarker);
    const userIcon = L.divIcon({ html: '<div class="bg-blue-500 rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width:40px;height:40px;"><i class="fas fa-user"></i></div>', className: '', iconSize:[40,40], iconAnchor:[20,20] });
    userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup("<strong>Your Location</strong>").openPopup();
    L.circle([userLocation.lat, userLocation.lng], { color:'#2A7D2E', fillColor:'#2A7D2E', fillOpacity:0.1, radius: document.getElementById('distanceRangeMap').value * 1000 }).addTo(map);
    statusEl.textContent = `Location found! Showing buyers within ${document.getElementById('distanceRangeMap').value} km.`;
    updateBuyerDistances(userLocation); renderBuyers();
  }, () => {
    statusEl.textContent = "Unable to retrieve your location. Please enter it manually.";
  }, { enableHighAccuracy:true, timeout:5000, maximumAge:0 });
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function deg2rad(deg) { return deg * (Math.PI/180); }
function updateBuyerDistances(loc) {
  buyers.forEach(b => {
    b.distanceKm = calculateDistance(loc.lat, loc.lng, b.lat, b.lng);
  });
}
function populateProduceFilter() {
  const select = document.getElementById('produceTypeFilter');
  const types = [...new Set(buyers.flatMap(b => b.produceWanted.map(p => p.toLowerCase())))];
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    select.appendChild(option);
  });
}
function renderBuyers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('produceTypeFilter').value.toLowerCase();
  const maxDist = Number(document.getElementById('distanceRange').value);
  const grid = document.getElementById('buyersGrid');
  const filtered = buyers.filter(b => b.distanceKm <= maxDist &&
    (!typeFilter || b.produceWanted.some(p => p.toLowerCase().includes(typeFilter))) &&
    (!query || (b.name + b.address + b.produceWanted.join(' ')).toLowerCase().includes(query))
  );
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  grid.innerHTML = '';
  filtered.forEach(b => {
    grid.innerHTML += `
      <div class="p-6 rounded-xl bg-white dark:bg-gray-800 card-hover hand-drawn-border">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-semibold text-lg dark:text-white">${b.name}</h3>
          <span class="px-2 py-1 bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary text-xs rounded-full">${b.type}</span>
        </div>
        <p class="text-sm text-neutral-600 dark:text-gray-300 mb-3 flex items-center gap-2"><i class="fas fa-map-marker-alt text-primary dark:text-secondary"></i> ${b.address}</p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300"><i class="fas fa-route text-primary dark:text-secondary"></i> Distance: ${b.distanceKm.toFixed(1)} km</p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300"><i class="fas fa-shopping-basket text-primary dark:text-secondary"></i> Wanted: ${b.produceWanted.join(', ')}</p>
        <p class="text-sm mb-4 flex items-center gap-2 dark:text-gray-300"><i class="fas fa-tag text-primary dark:text-secondary"></i> Avg Price: ₹${b.avgPrice}/kg</p>
        <button class="w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-secondary/20 dark:text-secondary dark:hover:bg-secondary/30 transition-colors text-sm font-medium">Contact Buyer</button>
      </div>`;
  });
  document.getElementById('resultsCount').textContent = filtered.length;
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initMap();
  populateProduceFilter();
  renderBuyers();
  document.getElementById('darkModeToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));
  document.getElementById('locateMe').addEventListener('click', locateUser);
  const mapSlider = document.getElementById('distanceRangeMap'),
        mapLabel = document.getElementById('distanceLabel'),
        searchSlider = document.getElementById('distanceRange'),
        searchLabel = document.getElementById('distanceValue');
  mapSlider.addEventListener('input', () => {
    mapLabel.textContent = mapSlider.value;
    if (userLocation) locateUser();
  });
  searchSlider.addEventListener('input', () => {
    searchLabel.textContent = searchSlider.value;
    renderBuyers();
  });
  ['searchInput', 'produceTypeFilter'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderBuyers)
  );
  document.getElementById('locationInput').addEventListener('change', function() {
    const status = document.getElementById('locationStatus');
    status.textContent = `Using manual location: ${this.value}. Distances are approximate.`;
    userLocation = {
      lat: defaultLocation[0] + (Math.random()*0.1 - 0.05),
      lng: defaultLocation[1] + (Math.random()*0.1 - 0.05)
    };
    updateBuyerDistances(userLocation);
    renderBuyers();
  });
  document.getElementById('submitListing').addEventListener('click', function() {
    const form = document.getElementById('listingForm');
    const statusEl = document.getElementById('formStatus');
    if (form.checkValidity()) {
      statusEl.classList.remove('hidden');
      setTimeout(() => statusEl.classList.add('hidden'), 3000);
    } else form.reportValidity();
  });
});