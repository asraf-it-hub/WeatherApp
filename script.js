const apiKey = '0fa7f5183cb6dc1c0b57c884d2fa78af';
let metric = true;

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

function formatTime(ts) {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function setPhotoBackgroundByCondition(condition) {
  // Debug log to see actual string received
  console.log("Weather API condition string:", condition);

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

  console.log("Loading background image:", imageFile);
  bgGradient.style.backgroundImage = `url('${imageFile}')`;
}


function displayWeather(data) {
  weatherCard.classList.remove('hidden');
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°${metric ? 'C' : 'F'}`;
  condition.textContent = data.weather[0].description;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} ${metric ? 'm/s' : 'mph'}`;
  pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  sunrise.textContent = `Sunrise: ${formatTime(data.sys.sunrise)}`;
  sunset.textContent = `Sunset: ${formatTime(data.sys.sunset)}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  weatherIcon.alt = data.weather[0].main;

  // Change background image based on condition
  const condStr = data.weather[0].main + " " + data.weather[0].description;
setPhotoBackgroundByCondition(condStr);

}

function showError(message) {
  errorMsg.classList.remove('hidden');
  errorMsg.textContent = message;
  weatherCard.classList.add('hidden');
  bgGradient.style.backgroundImage = "url('default.jpg')";
}

async function getWeather(city) {
  errorMsg.classList.add('hidden');
  unitToggle.textContent = metric ? "°F" : "°C";
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${metric ? 'metric' : 'imperial'}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('City not found.');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showError(err.message);
  }
}

async function getWeatherByCoords(lat, lon) {
  errorMsg.classList.add('hidden');
  unitToggle.textContent = metric ? "°F" : "°C";
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${metric ? 'metric' : 'imperial'}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Location not found.');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showError(err.message);
  }
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
  else showError('Please enter a city name.');
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

unitToggle.addEventListener('click', () => {
  metric = !metric;
  if (cityName.textContent) {
    getWeather(cityName.textContent.split(',')[0]);
  }
  unitToggle.textContent = metric ? "°F" : "°C";
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => showError("Location permission denied.")
    );
  } else showError('Geolocation not supported.');
});

// Set default background on load
bgGradient.style.backgroundImage = "url('weatherPhoto.avif')";
