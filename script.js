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

// Farmers Data
const farmers = [
  { id: 1, name: "Green Valley Farms", address: "Sector 18, Noida", produceAvailable: ["Organic Tomatoes", "Fresh Kale", "Wheat"], distanceKm: 5, price: 28, lat: 28.570, lng: 77.320 },
  { id: 2, name: "Fresh Harvest Farm", address: "Connaught Place, Delhi", produceAvailable: ["Cherry Tomatoes", "Spinach", "Basmati Rice"], distanceKm: 12, price: 35, lat: 28.633, lng: 77.220 },
  { id: 3, name: "Organic Oasis", address: "Saket, Delhi", produceAvailable: ["Apples", "Carrots", "Potatoes", "Wheat Flour"], distanceKm: 8, price: 25, lat: 28.527, lng: 77.220 },
  { id: 4, name: "Nature's Best", address: "Gurgaon Sector 29", produceAvailable: ["Organic Vegetables", "Herbs", "Grains"], distanceKm: 20, price: 40, lat: 28.460, lng: 77.080 },
  { id: 5, name: "Sunshine Farms", address: "Rajouri Garden", produceAvailable: ["Fresh Vegetables", "Spices", "Rice"], distanceKm: 10, price: 32, lat: 28.650, lng: 77.120 },
  { id: 6, name: "Grain Masters", address: "Faridabad", produceAvailable: ["Wheat", "Barley", "Corn"], distanceKm: 25, price: 22, lat: 28.409, lng: 77.317 }
];

// Buyers Data
const buyers = [
  { id: 1, name: "Green Grocery Store", address: "Sector 18, Noida", type: "Retailer", produceWanted: ["Organic Tomatoes", "Fresh Kale", "Wheat"], distanceKm: 5, avgPrice: 28, lat: 28.570, lng: 77.320 },
  { id: 2, name: "City Fresh Restaurant", address: "Connaught Place, Delhi", type: "Restaurant", produceWanted: ["Cherry Tomatoes", "Spinach", "Basmati Rice"], distanceKm: 12, avgPrice: 35, lat: 28.633, lng: 77.220 },
  { id: 3, name: "Farmers Market", address: "Saket, Delhi", type: "Market", produceWanted: ["Apples", "Carrots", "Potatoes", "Wheat Flour"], distanceKm: 8, avgPrice: 25, lat: 28.527, lng: 77.220 },
  { id: 4, name: "Organic Foods Retail", address: "Gurgaon Sector 29", type: "Retailer", produceWanted: ["Organic Vegetables", "Herbs", "Grains"], distanceKm: 20, avgPrice: 40, lat: 28.460, lng: 77.080 },
  { id: 5, name: "Delhi Kitchen", address: "Rajouri Garden", type: "Restaurant", produceWanted: ["Fresh Vegetables", "Spices", "Rice"], distanceKm: 10, avgPrice: 32, lat: 28.650, lng: 77.120 },
  { id: 6, name: "Grain Mill Corporation", address: "Faridabad", type: "Processor", produceWanted: ["Wheat", "Barley", "Corn"], distanceKm: 25, avgPrice: 22, lat: 28.409, lng: 77.317 }
];

// Global variables
let map, buyerMap, userMarker, buyerUserMarker, userLocation = null, buyerUserLocation = null;
const defaultLocation = [28.6139, 77.2090]; // Delhi coordinates

// Initialize Leaflet Map for Farmers
function initMap() {
  map = L.map('mapContainer').setView(defaultLocation, 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add buyers to map
  buyers.forEach(b => {
    // Create custom icon
    const customIcon = L.divIcon({
      html: `<div class="bg-primary rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width: 36px; height: 36px;">
              <i class="fas fa-store"></i>
            </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    
    const marker = L.marker([b.lat, b.lng], {icon: customIcon}).addTo(map);
    marker.bindPopup(`
      <div class="p-2">
        <h4 class="font-semibold text-primary">${b.name}</h4>
        <p class="text-sm my-1">${b.address}</p>
        <p class="text-sm my-1">Wants: ${b.produceWanted.join(', ')}</p>
        <p class="text-sm my-1">Avg Price: ₹${b.avgPrice}/kg</p>
      </div>
    `);
  });
}

// Initialize Leaflet Map for Buyers
function initBuyerMap() {
  buyerMap = L.map('buyerMapContainer').setView(defaultLocation, 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(buyerMap);

  // Add farmers to map
  farmers.forEach(f => {
    // Create custom icon
    const customIcon = L.divIcon({
      html: `<div class="bg-green-600 rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width: 36px; height: 36px;">
              <i class="fas fa-tractor"></i>
            </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    
    const marker = L.marker([f.lat, f.lng], {icon: customIcon}).addTo(buyerMap);
    marker.bindPopup(`
      <div class="p-2">
        <h4 class="font-semibold text-primary">${f.name}</h4>
        <p class="text-sm my-1">${f.address}</p>
        <p class="text-sm my-1">Available: ${f.produceAvailable.join(', ')}</p>
        <p class="text-sm my-1">Price: ₹${f.price}/kg</p>
      </div>
    `);
  });
}

// Get user's location for farmers
function locateUser() {
  const statusElement = document.getElementById('locationStatus');
  statusElement.textContent = "Locating...";
  
  if (!navigator.geolocation) {
    statusElement.textContent = "Geolocation is not supported by your browser";
    return;
  }
  
  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    userLocation = { lat: latitude, lng: longitude };
    
    // Update map view
    map.setView([latitude, longitude], 13);
    
    // Add or update user marker
    if (userMarker) {
      map.removeLayer(userMarker);
    }
    
    // Create custom user icon
    const userCustomIcon = L.divIcon({
      html: `<div class="bg-blue-500 rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width: 40px; height: 40px;">
              <i class="fas fa-user"></i>
            </div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    
    userMarker = L.marker([latitude, longitude], {icon: userCustomIcon})
      .addTo(map)
      .bindPopup("<strong>Your Location</strong>")
      .openPopup();
    
    // Add a circle around the user location
    L.circle([latitude, longitude], {
      color: '#2A7D2E',
      fillColor: '#2A7D2E',
      fillOpacity: 0.1,
      radius: document.getElementById('distanceRangeMap').value * 1000
    }).addTo(map);
    
    statusElement.textContent = `Location found! Showing buyers within ${document.getElementById('distanceRangeMap').value} km.`;
    
    // Update buyer distances based on user location
    updateBuyerDistances(userLocation);
    renderBuyers();
  }
  
  function error() {
    statusElement.textContent = "Unable to retrieve your location. Please enter it manually.";
  }
  
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });
}

// Get user's location for buyers
function locateBuyerUser() {
  const statusElement = document.getElementById('buyerLocationStatus');
  statusElement.textContent = "Locating...";
  
  if (!navigator.geolocation) {
    statusElement.textContent = "Geolocation is not supported by your browser";
    return;
  }
  
  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    buyerUserLocation = { lat: latitude, lng: longitude };
    
    // Update map view
    buyerMap.setView([latitude, longitude], 13);
    
    // Add or update user marker
    if (buyerUserMarker) {
      buyerMap.removeLayer(buyerUserMarker);
    }
    
    // Create custom user icon
    const userCustomIcon = L.divIcon({
      html: `<div class="bg-blue-500 rounded-full p-2 flex items-center justify-center text-white shadow-md" style="width: 40px; height: 40px;">
              <i class="fas fa-user"></i>
            </div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    
    buyerUserMarker = L.marker([latitude, longitude], {icon: userCustomIcon})
      .addTo(buyerMap)
      .bindPopup("<strong>Your Location</strong>")
      .openPopup();
    
    // Add a circle around the user location
    L.circle([latitude, longitude], {
      color: '#2A7D2E',
      fillColor: '#2A7D2E',
      fillOpacity: 0.1,
      radius: document.getElementById('buyerDistanceRangeMap').value * 1000
    }).addTo(buyerMap);
    
    statusElement.textContent = `Location found! Showing farmers within ${document.getElementById('buyerDistanceRangeMap').value} km.`;
    
    // Update farmer distances based on user location
    updateFarmerDistances(buyerUserLocation);
    renderFarmers();
  }
  
  function error() {
    statusElement.textContent = "Unable to retrieve your location. Please enter it manually.";
  }
  
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Update buyer distances based on user location
function updateBuyerDistances(userLoc) {
  buyers.forEach(buyer => {
    buyer.distanceKm = calculateDistance(
      userLoc.lat, userLoc.lng, 
      buyer.lat, buyer.lng
    );
  });
}

// Update farmer distances based on user location
function updateFarmerDistances(userLoc) {
  farmers.forEach(farmer => {
    farmer.distanceKm = calculateDistance(
      userLoc.lat, userLoc.lng, 
      farmer.lat, farmer.lng
    );
  });
}

// Render buyer cards for farmers
function renderBuyers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('produceTypeFilter').value.toLowerCase();
  const maxDistance = Number(document.getElementById('distanceRange').value);
  const grid = document.getElementById('buyersGrid');

  const filtered = buyers.filter(b =>
    b.distanceKm <= maxDistance &&
    (!typeFilter || b.produceWanted.some(p => {
      const produceType = getProduceType(p);
      return produceType === typeFilter;
    })) &&
    (!query || (b.name + b.address + b.produceWanted.join(' ')).toLowerCase().includes(query))
  );

  // Sort by distance
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);

  grid.innerHTML = '';
  filtered.forEach(b => {
    grid.innerHTML += `
      <div class="p-6 rounded-xl bg-white dark:bg-gray-800 card-hover hand-drawn-border">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-semibold text-lg dark:text-white">${b.name}</h3>
          <span class="px-2 py-1 bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary text-xs rounded-full">${b.type}</span>
        </div>
        <p class="text-sm text-neutral-600 dark:text-gray-300 mb-3 flex items-center gap-2">
          <i class="fas fa-map-marker-alt text-primary dark:text-secondary"></i> ${b.address}
        </p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-route text-primary dark:text-secondary"></i> Distance: ${b.distanceKm.toFixed(1)} km
        </p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-shopping-basket text-primary dark:text-secondary"></i> Wanted: ${b.produceWanted.join(', ')}
        </p>
        <p class="text-sm mb-4 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-tag text-primary dark:text-secondary"></i> Avg Price: ₹${b.avgPrice}/kg
        </p>
        <button class="w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-secondary/20 dark:text-secondary dark:hover:bg-secondary/30 transition-colors text-sm font-medium">
          Contact Buyer
        </button>
      </div>`;
  });

  document.getElementById('resultsCount').textContent = filtered.length;
}

// Render farmer cards for buyers
function renderFarmers() {
  const query = document.getElementById('buyerSearchInput').value.toLowerCase();
  const typeFilter = document.getElementById('buyerProduceTypeFilter').value.toLowerCase();
  const maxDistance = Number(document.getElementById('buyerDistanceRange').value);
  const grid = document.getElementById('farmersGrid');

  const filtered = farmers.filter(f =>
    f.distanceKm <= maxDistance &&
    (!typeFilter || f.produceAvailable.some(p => {
      const produceType = getProduceType(p);
      return produceType === typeFilter;
    })) &&
    (!query || (f.name + f.address + f.produceAvailable.join(' ')).toLowerCase().includes(query))
  );

  // Sort by distance
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);

  grid.innerHTML = '';
  filtered.forEach(f => {
    grid.innerHTML += `
      <div class="p-6 rounded-xl bg-white dark:bg-gray-800 card-hover hand-drawn-border">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-semibold text-lg dark:text-white">${f.name}</h3>
          <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs rounded-full">Farmer</span>
        </div>
        <p class="text-sm text-neutral-600 dark:text-gray-300 mb-3 flex items-center gap-2">
          <i class="fas fa-map-marker-alt text-primary dark:text-secondary"></i> ${f.address}
        </p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-route text-primary dark:text-secondary"></i> Distance: ${f.distanceKm.toFixed(1)} km
        </p>
        <p class="text-sm mb-3 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-seedling text-primary dark:text-secondary"></i> Available: ${f.produceAvailable.join(', ')}
        </p>
        <p class="text-sm mb-4 flex items-center gap-2 dark:text-gray-300">
          <i class="fas fa-tag text-primary dark:text-secondary"></i> Price: ₹${f.price}/kg
        </p>
        <button class="w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-secondary/20 dark:text-secondary dark:hover:bg-secondary/30 transition-colors text-sm font-medium">
          Contact Farmer
        </button>
      </div>`;
  });

  document.getElementById('buyerResultsCount').textContent = filtered.length;
}

// Helper function to determine produce type
function getProduceType(produce) {
  const grains = ['wheat', 'rice', 'barley', 'corn', 'oat', 'millet', 'quinoa', 'grain', 'flour'];
  const fruits = ['apple', 'banana', 'orange', 'mango', 'berry', 'grape', 'peach', 'pear', 'plum', 'fruit'];
  const vegetables = ['tomato', 'potato', 'carrot', 'spinach', 'kale', 'lettuce', 'cabbage', 'onion', 'vegetable'];
  const dairy = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'];
  
  const lowerProduce = produce.toLowerCase();
  
  if (grains.some(grain => lowerProduce.includes(grain))) return 'grain';
  if (fruits.some(fruit => lowerProduce.includes(fruit))) return 'fruit';
  if (vegetables.some(vegetable => lowerProduce.includes(vegetable))) return 'vegetable';
  if (dairy.some(dairy => lowerProduce.includes(dairy))) return 'dairy';
  
  return 'other';
}

// Modal functionality
function setupModals() {
  const loginModal = document.getElementById('loginModal');
  const orderModal = document.getElementById('orderModal');
  const buyerLoginBtn = document.getElementById('buyerLoginBtn');
  const mobileBuyerLoginBtn = document.getElementById('mobileBuyerLoginBtn');
  const openOrderModalBtn = document.getElementById('openOrderModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const closeOrderModal = document.getElementById('closeOrderModal');
  const loginForm = document.getElementById('loginForm');
  const orderForm = document.getElementById('orderForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const buyerDashboard = document.getElementById('buyerDashboard');
  const mainContent = document.querySelector('body > :not(#buyerDashboard)');
  
  // Open login modal
  [buyerLoginBtn, mobileBuyerLoginBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      loginModal.style.display = 'flex';
    });
  });
  
  // Open order modal
  openOrderModalBtn.addEventListener('click', () => {
    orderModal.style.display = 'flex';
  });
  
  // Close login modal
  closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
  
  // Close order modal
  closeOrderModal.addEventListener('click', () => {
    orderModal.style.display = 'none';
  });
  
  // Login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    
    // Hide main content and show dashboard
    mainContent.style.display = 'none';
    buyerDashboard.classList.remove('hidden');
    
    // Initialize charts
    initCharts();
  });
  
  // Order form submission
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderModal.style.display = 'none';
    alert('Order request submitted! Farmers will contact you with their offers.');
  });
  
  // Logout functionality
  logoutBtn.addEventListener('click', () => {
    buyerDashboard.classList.add('hidden');
    mainContent.style.display = 'block';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (e.target === orderModal) {
      orderModal.style.display = 'none';
    }
  });
}

// Initialize charts for buyer dashboard
function initCharts() {
  // Produce types chart
  const produceCtx = document.getElementById('produceChart').getContext('2d');
  new Chart(produceCtx, {
    type: 'doughnut',
    data: {
      labels: ['Vegetables', 'Fruits', 'Grains', 'Dairy'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
          '#2A7D2E', // primary green
          '#FF9E1F', // secondary orange
          '#8BC34A', // accent light green
          '#4CAF50'  // another green
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#000'
          }
        }
      }
    }
  });
  
  // Spending trend chart
  const spendingCtx = document.getElementById('spendingChart').getContext('2d');
  new Chart(spendingCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [{
        label: 'Monthly Spending (₹)',
        data: [65000, 59000, 72000, 81000, 78000, 85000, 93000, 91000, 89000, 82560],
        borderColor: '#2A7D2E',
        backgroundColor: 'rgba(42, 125, 46, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#000'
          }
        },
        x: {
          grid: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#000'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#000'
          }
        }
      }
    }
  });
}

// QR Code scanning simulation
function setupQRScanner() {
  const qrScanner = document.getElementById('qr-scanner');
  
  qrScanner.addEventListener('click', () => {
    alert('QR scanner activated. In a real application, this would open your camera to scan a QR code. For demonstration, we\'re showing sample supply chain data.');
    
    // Highlight the timeline
    document.querySelectorAll('.timeline-step').forEach((step, index) => {
      setTimeout(() => {
        step.style.opacity = '1';
        step.style.transition = 'opacity 0.5s ease';
      }, index * 300);
    });
  });
}

// User type tabs functionality
function setupUserTabs() {
  const farmerTab = document.getElementById('farmerTab');
  const buyerTab = document.getElementById('buyerTab');
  const farmerContent = document.getElementById('farmerContent');
  const buyerContent = document.getElementById('buyerContent');
  
  farmerTab.addEventListener('click', () => {
    farmerTab.classList.add('active');
    buyerTab.classList.remove('active');
    farmerContent.classList.add('active');
    buyerContent.classList.remove('active');
  });
  
  buyerTab.addEventListener('click', () => {
    buyerTab.classList.add('active');
    farmerTab.classList.remove('active');
    buyerContent.classList.add('active');
    farmerContent.classList.remove('active');
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initMap();
  initBuyerMap();
  renderBuyers();
  renderFarmers();
  setupModals();
  setupQRScanner();
  setupUserTabs();

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });

  // Add event listener for location buttons
  document.getElementById('locateMe').addEventListener('click', locateUser);
  document.getElementById('buyerLocateMe').addEventListener('click', locateBuyerUser);

  // Make sliders interactive for farmers
  const mapSlider = document.getElementById('distanceRangeMap');
  const mapLabel = document.getElementById('distanceLabel');
  const searchSlider = document.getElementById('distanceRange');
  const searchLabel = document.getElementById('distanceValue');

  mapSlider.addEventListener('input', () => {
    mapLabel.textContent = mapSlider.value;
    if (userLocation) {
      // Update the circle radius if user location is set
      locateUser(); // This will recreate the circle with new radius
    }
  });

  searchSlider.addEventListener('input', () => {
    searchLabel.textContent = searchSlider.value;
    renderBuyers();
  });

  // Make sliders interactive for buyers
  const buyerMapSlider = document.getElementById('buyerDistanceRangeMap');
  const buyerMapLabel = document.getElementById('buyerDistanceLabel');
  const buyerSearchSlider = document.getElementById('buyerDistanceRange');
  const buyerSearchLabel = document.getElementById('buyerDistanceValue');

  buyerMapSlider.addEventListener('input', () => {
    buyerMapLabel.textContent = buyerMapSlider.value;
    if (buyerUserLocation) {
      // Update the circle radius if user location is set
      locateBuyerUser(); // This will recreate the circle with new radius
    }
  });

  buyerSearchSlider.addEventListener('input', () => {
    buyerSearchLabel.textContent = buyerSearchSlider.value;
    renderFarmers();
  });

  // Search inputs for farmers
  ['searchInput', 'produceTypeFilter'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderBuyers)
  );

  // Search inputs for buyers
  ['buyerSearchInput', 'buyerProduceTypeFilter'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderFarmers)
  );

  // Manual location input for farmers
  document.getElementById('locationInput').addEventListener('change', function() {
    // In a real app, you would geocode this address to coordinates
    const statusElement = document.getElementById('locationStatus');
    statusElement.textContent = `Using manual location: ${this.value}. Distances are approximate.`;
    
    // For demo purposes, we'll just use a random location near Delhi
    userLocation = {
      lat: defaultLocation[0] + (Math.random() * 0.1 - 0.05),
      lng: defaultLocation[1] + (Math.random() * 0.1 - 0.05)
    };
    
    updateBuyerDistances(userLocation);
    renderBuyers();
  });

  // Manual location input for buyers
  document.getElementById('buyerLocationInput').addEventListener('change', function() {
    // In a real app, you would geocode this address to coordinates
    const statusElement = document.getElementById('buyerLocationStatus');
    statusElement.textContent = `Using manual location: ${this.value}. Distances are approximate.`;
    
    // For demo purposes, we'll just use a random location near Delhi
    buyerUserLocation = {
      lat: defaultLocation[0] + (Math.random() * 0.1 - 0.05),
      lng: defaultLocation[1] + (Math.random() * 0.1 - 0.05)
    };
    
    updateFarmerDistances(buyerUserLocation);
    renderFarmers();
  });

  // Form submission for farmers
  document.getElementById('submitListing').addEventListener('click', function() {
    const form = document.getElementById('listingForm');
    const statusElement = document.getElementById('formStatus');
    
    if (form.checkValidity()) {
      statusElement.classList.remove('hidden');
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 3000);
    } else {
      form.reportValidity();
    }
  });

  // Form submission for buyers
  document.getElementById('submitBuyerRegistration').addEventListener('click', function() {
    const form = document.getElementById('buyerRegistrationForm');
    const statusElement = document.getElementById('buyerFormStatus');
    
    if (form.checkValidity()) {
      statusElement.classList.remove('hidden');
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 3000);
    } else {
      form.reportValidity();
    }
  });
});