const apiKey = '0fa7f5183cb6dc1c0b57c884d2fa78af';
let metric = true;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');
const weatherCard = document.getElementById('weatherCard');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const errorMsg = document.getElementById('errorMsg');
const bgGradient = document.getElementById('bg-gradient');
const loading = document.getElementById('loading');
const forecastContainer = document.getElementById('forecastContainer');
const forecast = document.getElementById('forecast');
const historyBtn = document.getElementById('historyBtn');
const searchHistory = document.getElementById('searchHistory');
const historyList = document.getElementById('historyList');

// Format time function
function formatTime(ts) {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Format date for forecast
function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
}

// Set background image based on weather condition
function setPhotoBackgroundByCondition(condition) {
  let imageFile = 'default.jpg'; // fallback
  const cond = condition.toLowerCase();

  if (cond.includes('clear') || cond.includes('sun')) {
    imageFile = 'sunny.jpg';
  } else if (cond.includes('cloud')) {
    imageFile = 'cloud.jpg';
  } else if (cond.includes('rain')) {
    imageFile = 'rainy.jpg';
  } else if (cond.includes('snow')) {
    imageFile = 'snow.jpg';
  } else if (cond.includes('mist') || cond.includes('fog')) {
    imageFile = 'mist.avif';
  } else if (cond.includes('thunder')) {
    imageFile = 'thunderstorm.jpg';
  }

  bgGradient.style.backgroundImage = `url('${imageFile}')`;
}

// Show loading state
function showLoading() {
  loading.classList.remove('hidden');
}

// Hide loading state
function hideLoading() {
  loading.classList.add('hidden');
}

// Add city to search history
function addToSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  // Remove duplicate entries
  history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
  // Add new city at the beginning
  history.unshift(city);
  // Keep only the last 5 searches
  history = history.slice(0, 5);
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  updateSearchHistory();
}

// Update search history display
function updateSearchHistory() {
  const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  historyList.innerHTML = '';
  history.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => {
      cityInput.value = city;
      getWeather(city);
      searchHistory.classList.add('hidden');
    });
    historyList.appendChild(li);
  });
}

// Toggle search history visibility
historyBtn.addEventListener('click', () => {
  const isVisible = !searchHistory.classList.contains('hidden');
  searchHistory.classList.toggle('hidden', isVisible);
});

// Close search history when clicking outside
document.addEventListener('click', (e) => {
  if (!searchHistory.contains(e.target) && e.target !== historyBtn) {
    searchHistory.classList.add('hidden');
  }
});

// Display current weather data
function displayWeather(data) {
  weatherCard.classList.remove('hidden');
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°${metric ? 'C' : 'F'}`;
  condition.textContent = data.weather[0].description;
  humidity.innerHTML = `<i class="fas fa-tint"></i> ${data.main.humidity}%`;
  wind.innerHTML = `<i class="fas fa-wind"></i> ${data.wind.speed} ${metric ? 'm/s' : 'mph'}`;
  pressure.innerHTML = `<i class="fas fa-thermometer-full"></i> ${data.main.pressure} hPa`;
  sunrise.innerHTML = `<i class="fas fa-sun"></i> ${formatTime(data.sys.sunrise)}`;
  sunset.innerHTML = `<i class="fas fa-moon"></i> ${formatTime(data.sys.sunset)}`;
 weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  weatherIcon.alt = data.weather[0].main;

  // Change background image based on condition
  const condStr = data.weather[0].main + " " + data.weather[0].description;
  setPhotoBackgroundByCondition(condStr);
}

// Display 5-day forecast
async function displayForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${metric ? 'metric' : 'imperial'}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast data not found.');
    const data = await res.json();
    
    // Group forecast data by day (every 8th entry is roughly 24 hours apart)
    const dailyForecast = [];
    for (let i = 0; i < data.list.length; i += 8) {
      dailyForecast.push(data.list[i]);
    }
    
    forecast.innerHTML = '';
    dailyForecast.forEach(day => {
      const forecastDay = document.createElement('div');
      forecastDay.className = 'forecast-day';
      forecastDay.innerHTML = `
        <div>${formatDate(day.dt * 1000)}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
        <div class="forecast-temp">${Math.round(day.main.temp)}°${metric ? 'C' : 'F'}</div>
        <div class="forecast-condition">${day.weather[0].description}</div>
      `;
      forecast.appendChild(forecastDay);
    });
    
    forecastContainer.classList.remove('hidden');
  } catch (err) {
    console.error('Error fetching forecast:', err);
    forecastContainer.classList.add('hidden');
  }
}

// Show error message
function showError(message) {
  errorMsg.classList.remove('hidden');
  errorMsg.textContent = message;
  weatherCard.classList.add('hidden');
  forecastContainer.classList.add('hidden');
  bgGradient.style.backgroundImage = "url('default.jpg')";
}

// Get current weather
async function getWeather(city) {
  showLoading();
  errorMsg.classList.add('hidden');
  unitToggle.textContent = metric ? "°C/°F" : "°F/°C";
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${metric ? 'metric' : 'imperial'}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'City not found.');
    }
    const data = await res.json();
    displayWeather(data);
    addToSearchHistory(data.name);
    await displayForecast(data.name);
  } catch (err) {
    showError(err.message || 'An error occurred while fetching weather data.');
  } finally {
    hideLoading();
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  showLoading();
  errorMsg.classList.add('hidden');
  unitToggle.textContent = metric ? "°C/°F" : "°F/°C";
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${metric ? 'metric' : 'imperial'}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Location not found.');
    }
    const data = await res.json();
    displayWeather(data);
    addToSearchHistory(data.name);
    await displayForecast(data.name);
  } catch (err) {
    showError(err.message || 'An error occurred while fetching weather data.');
  } finally {
    hideLoading();
  }
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    showError('Please enter a city name.');
  }
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

unitToggle.addEventListener('click', () => {
  metric = !metric;
  unitToggle.textContent = metric ? "°C/°F" : "°F/°C";
  if (cityName.textContent) {
    const city = cityName.textContent.split(',')[0].trim();
    getWeather(city);
  }
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        hideLoading();
        showError("Location permission denied.");
      }
    );
  } else {
    showError('Geolocation not supported.');
  }
});

// Initialize search history on page load
document.addEventListener('DOMContentLoaded', () => {
  updateSearchHistory();
});

// Set default background on load
bgGradient.style.backgroundImage = "url('sunny.jpg')"; // Using sunny.jpg as default instead of non-existent file
