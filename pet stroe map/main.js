const map = L.map("map").setView([3.139, 101.6869], 10); // KL view

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const petLocations = [
  { lat: 3.0732, lon: 101.5163, name: "Selangor Pet Clinic", type: "Veterinary Clinic" },
  { lat: 3.1412, lon: 101.6869, name: "Kuala Lumpur Pet Clinic", type: "Veterinary Clinic" },
  { lat: 3.0369, lon: 101.6172, name: "Setia Alam Pet Shop", type: "Pet Store" },
  { lat: 3.1412, lon: 101.7116, name: "Pets' Garden", type: "Pet Store" },
  { lat: 3.0434, lon: 101.5084, name: "Pets' Wonderland Selangor", type: "Pet Store" },
  { lat: 3.013, lon: 101.6641, name: "Bukit Jalil Vet Clinic", type: "Veterinary Clinic" },
  { lat: 3.1578, lon: 101.7115, name: "Pet Care Clinic, KL", type: "Veterinary Clinic" },
  { lat: 3.086, lon: 101.7124, name: "KL Pets", type: "Pet Store" },
  { lat: 3.144, lon: 101.6845, name: "Selangor Animal Clinic", type: "Veterinary Clinic" },
  { lat: 3.0872, lon: 101.6882, name: "Setia Alam Pet Shop", type: "Pet Store" },
  { lat: 3.165, lon: 101.7112, name: "Kuala Lumpur Pet Clinic 2", type: "Veterinary Clinic" },
  { lat: 3.1291, lon: 101.6931, name: "Pet Vet Selangor", type: "Veterinary Clinic" }
];

const favoriteSet = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
let markers = [];

function renderMarkers(locations) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  locations.forEach(loc => {
    const isFavorite = favoriteSet.has(loc.name);
    const marker = L.marker([loc.lat, loc.lon]).addTo(map);
    const osmLink = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=18/${loc.lat}/${loc.lon}`;
    marker.bindPopup(`
      <b>${loc.name}</b><br>${loc.type}<br>
      <a href="${osmLink}" target="_blank">View on OpenStreetMap</a><br>
      <button onclick="toggleFavorite('${loc.name}')">${isFavorite ? '★' : '☆'} Favorite</button>
    `);
    markers.push(marker);
  });
}

function toggleFavorite(name) {
  if (favoriteSet.has(name)) favoriteSet.delete(name);
  else favoriteSet.add(name);
  localStorage.setItem("favorites", JSON.stringify([...favoriteSet]));
  searchLocations();
}

function searchLocations() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const type = document.getElementById("typeFilter").value;
  const filtered = petLocations.filter(loc => {
    return loc.name.toLowerCase().includes(query) && (type === "all" || loc.type === type);
  });
  renderMarkers(filtered);
  if (filtered.length) map.fitBounds(filtered.map(loc => [loc.lat, loc.lon]));
}

function showFavorites() {
  const favorites = petLocations.filter(loc => favoriteSet.has(loc.name));
  renderMarkers(favorites);
  if (favorites.length) map.fitBounds(favorites.map(loc => [loc.lat, loc.lon]));
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    L.circle([latitude, longitude], {
      radius: 1000,
      color: "blue",
      fillColor: "blue",
      fillOpacity: 0.2,
    }).addTo(map).bindPopup("You are here.").openPopup();
    map.setView([latitude, longitude], 12);
  });
}

renderMarkers(petLocations);
