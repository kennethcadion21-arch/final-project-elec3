// ========================================
// MODERN WEATHER APP - Refactored
// Clean API integration with modern UX
// ========================================

const API_KEY = "cc17573d7efee0aa292064c62f2819bd";

// ========================================
// API CONFIGURATION
// ========================================

const API = {
  GEO: "https://api.openweathermap.org/geo/1.0/direct",
  WEATHER: "https://api.openweathermap.org/data/2.5/weather",
  FORECAST: "https://api.openweathermap.org/data/2.5/forecast",
};

// ========================================
// DOM REFERENCES
// ========================================

const DOM = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  statusEl: document.getElementById("status"),
  errorBox: document.getElementById("errorBox"),
  placeSelect: document.getElementById("placeSelect"),
  themeToggle: document.getElementById("themeToggle"),
  weatherBox: document.getElementById("weatherResult"),
  cityName: document.getElementById("cityName"),
  country: document.getElementById("country"),
  description: document.getElementById("description"),
  temp: document.getElementById("temp"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  forecastBox: document.getElementById("forecastBox"),
  forecastGrid: document.getElementById("forecastGrid"),
};

// ========================================
// UI HELPER FUNCTIONS
// ========================================

/**
 * Set loading state
 */
function setLoading(isLoading, message = "") {
  DOM.statusEl.textContent = message;
  DOM.searchBtn.disabled = isLoading;
  DOM.cityInput.disabled = isLoading;
  DOM.placeSelect.disabled = isLoading;
}

/**
 * Show error message
 */
function showError(message) {
  DOM.errorBox.textContent = message;
  DOM.errorBox.classList.remove("hidden");
}

/**
 * Clear error message
 */
function clearError() {
  DOM.errorBox.textContent = "";
  DOM.errorBox.classList.add("hidden");
}

/**
 * Hide all results
 */
function hideResults() {
  DOM.weatherBox.classList.add("hidden");
  DOM.forecastBox.classList.add("hidden");
  DOM.forecastGrid.innerHTML = "";
}

/**
 * Hide location select dropdown
 */
function hidePlaceSelect() {
  DOM.placeSelect.classList.add("hidden");
  DOM.placeSelect.innerHTML = "";
}

/**
 * Validate city input
 */
function validateCityInput(value) {
  const city = value.trim();

  if (!city) {
    return { ok: false, message: "Please enter a city name." };
  }
  if (city.length < 2) {
    return { ok: false, message: "City name must be at least 2 characters." };
  }

  const allowed = /^[a-zA-ZÀ-ž\s.,'-]+$/;
  if (!allowed.test(city)) {
    return { ok: false, message: "Please use only letters and basic punctuation." };
  }

  return { ok: true, city };
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Fetch JSON from URL
 */
async function fetchJSON(url) {
  const res = await fetch(url);

  if (!res.ok) {
    let errorMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) errorMessage += ` - ${data.message}`;
    } catch (e) {
      // Silently ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Geocode city to get location options
 */
async function geocodeCityOptions(city) {
  const url = `${API.GEO}?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;
  const data = await fetchJSON(url);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Location not found. Please check the spelling.");
  }

  return data;
}

/**
 * Get current weather for coordinates
 */
async function getCurrentWeather(lat, lon) {
  const url = `${API.WEATHER}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchJSON(url);
}

/**
 * Get 5-day forecast for coordinates
 */
async function getForecast(lat, lon) {
  const url = `${API.FORECAST}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchJSON(url);
}

// ========================================
// LOCATION FUNCTIONS
// ========================================

/**
 * Format location display string
 */
function formatLocationString(place) {
  const state = place.state ? `, ${place.state}` : "";
  return `${place.name}${state}, ${place.country}`;
}

/**
 * Populate location dropdown
 */
function populateLocationSelect(places) {
  DOM.placeSelect.innerHTML = "";

  places.forEach((place) => {
    const option = document.createElement("option");
    option.value = JSON.stringify({
      lat: place.lat,
      lon: place.lon,
      name: place.name,
      state: place.state || "",
      country: place.country || "",
    });
    option.textContent = formatLocationString(place);
    DOM.placeSelect.appendChild(option);
  });

  DOM.placeSelect.classList.remove("hidden");
}

/**
 * Get selected location from dropdown
 */
function getSelectedLocation() {
  return JSON.parse(DOM.placeSelect.value);
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

/**
 * Display current weather
 */
function displayCurrentWeather(data, location) {
  const cityName = location?.name || data.name || "Unknown";
  const stateName = location?.state ? `, ${location.state}` : "";
  const countryName = location?.country || data.sys?.country || "";

  const description = data.weather?.[0]?.description || "N/A";
  const temperature = Math.round(data.main?.temp ?? 0);
  const feelsLike = Math.round(data.main?.feels_like ?? 0);
  const humidity = data.main?.humidity ?? 0;
  const windSpeed = Math.round(data.wind?.speed ?? 0 * 10) / 10;

  DOM.cityName.textContent = `${cityName}${stateName}`;
  DOM.country.textContent = countryName ? `📍 ${countryName}` : "";
  DOM.description.textContent = description;
  DOM.temp.textContent = temperature;
  DOM.feelsLike.textContent = feelsLike;
  DOM.humidity.textContent = humidity;
  DOM.wind.textContent = windSpeed;

  DOM.weatherBox.classList.remove("hidden");
}

/**
 * Extract daily forecast from 3-hour interval data
 */
function getDailyForecast(forecastList) {
  const dailyMap = new Map();

  // Group by day
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split("T")[0];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey).push(item);
  });

  // Pick best time for each day (closest to noon)
  const dailyForecasts = [];
  let dayCount = 0;

  for (const [, dayItems] of dailyMap) {
    if (dayCount >= 5) break;

    let bestItem = dayItems[0];
    let bestDistance = Infinity;

    dayItems.forEach((item) => {
      const itemDate = new Date(item.dt * 1000);
      const hourDistance = Math.abs(itemDate.getUTCHours() - 12);

      if (hourDistance < bestDistance) {
        bestDistance = hourDistance;
        bestItem = item;
      }
    });

    dailyForecasts.push(bestItem);
    dayCount++;
  }

  return dailyForecasts;
}

/**
 * Format day label from unix timestamp
 */
function formatDayLabel(unixSeconds) {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Display 5-day forecast
 */
function displayForecast(forecastData) {
  const list = forecastData.list || [];
  if (list.length === 0) return;

  const dailyForecasts = getDailyForecast(list);
  DOM.forecastGrid.innerHTML = "";

  dailyForecasts.forEach((item) => {
    const temp = Math.round(item.main?.temp ?? 0);
    const description = item.weather?.[0]?.description || "N/A";
    const dayLabel = formatDayLabel(item.dt);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="f-day">${dayLabel}</p>
      <p class="f-temp">${temp}°C</p>
      <p class="f-desc">${description}</p>
    `;
    DOM.forecastGrid.appendChild(card);
  });

  DOM.forecastBox.classList.remove("hidden");
}

// ========================================
// MAIN FUNCTIONS
// ========================================

/**
 * Fetch and display weather for selected location
 */
async function fetchWeatherForLocation(location) {
  hideResults();
  clearError();

  try {
    setLoading(true, "⏳ Loading weather...");

    const [currentWeather, forecastData] = await Promise.all([
      getCurrentWeather(location.lat, location.lon),
      getForecast(location.lat, location.lon),
    ]);

    displayCurrentWeather(currentWeather, location);
    displayForecast(forecastData);
    setLoading(false, "✓ Weather loaded");

    // Clear status after 2 seconds
    setTimeout(() => {
      DOM.statusEl.textContent = "";
    }, 2000);
  } catch (err) {
    console.error(err);
    setLoading(false, "");
    showError(err.message || "Failed to fetch weather data.");
  }
}

/**
 * Search for city and show location options
 */
async function searchCity() {
  clearError();
  hideResults();
  hidePlaceSelect();

  const validation = validateCityInput(DOM.cityInput.value);
  if (!validation.ok) {
    showError(validation.message);
    return;
  }

  try {
    setLoading(true, "🔍 Searching...");

    const locations = await geocodeCityOptions(validation.city);
    populateLocationSelect(locations);

    setLoading(false, "");
    await fetchWeatherForLocation(getSelectedLocation());
  } catch (err) {
    console.error(err);
    setLoading(false, "");
    showError(err.message || "Failed to search for location.");
  }
}

// ========================================
// THEME MANAGEMENT
// ========================================

/**
 * Initialize theme from localStorage
 */
function initTheme() {
  const savedTheme = localStorage.getItem("weather_theme");
  const theme = savedTheme || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
  DOM.themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("weather_theme", nextTheme);
  updateThemeIcon(nextTheme);
}

// ========================================
// EVENT LISTENERS
// ========================================

DOM.searchBtn.addEventListener("click", searchCity);
DOM.cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchCity();
});
DOM.placeSelect.addEventListener("change", () => {
  fetchWeatherForLocation(getSelectedLocation());
});
DOM.themeToggle.addEventListener("click", toggleTheme);

// ========================================
// INITIALIZE
// ========================================

initTheme();
