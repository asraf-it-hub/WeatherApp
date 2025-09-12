async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "0fa7f5183cb6dc1c0b57c884d2fa78af"; // <-- replace with your key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    
    document.getElementById("weatherResult").innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p>🌡️ Temperature: ${data.main.temp}°C</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
      <p>☁️ Weather: ${data.weather[0].description}</p>
    `;
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}
