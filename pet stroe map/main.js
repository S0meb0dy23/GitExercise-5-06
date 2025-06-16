  let map = L.map('map').setView([3.139, 101.6869], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  let allMarkers = [];
  let favorites = JSON.parse(localStorage.getItem('favorites') || "[]");

  async function loadLocations() {
    const res = await fetch('/locations');
    const data = await res.json();
    allMarkers = [];

    data.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng]).addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.address}<br>${loc.type}<br>
          <button onclick="toggleFavorite(${loc.id})">
          ${favorites.includes(loc.id) ? '★ Remove Favorite' : '☆ Add Favorite'}</button>`);
      marker._locationId = loc.id;
      allMarkers.push(marker);
    });
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(fav => fav !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadLocations();
  }

  function toggleFavorites() {
    allMarkers.forEach(marker => {
      if (!favorites.includes(marker._locationId)) {
        map.removeLayer(marker);
      } else {
        map.addLayer(marker);
      }
    });
  }

  function showNearby() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        map.setView([userLat, userLng], 14);
        L.marker([userLat, userLng], {color: 'blue'}).addTo(map).bindPopup("You are here").openPopup();
      });
    }
  }

  function locateUser() {
    showNearby();
  }

  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  }

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  loadLocations();
