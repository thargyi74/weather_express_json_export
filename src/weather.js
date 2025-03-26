const fetch = require("node-fetch");

async function getWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FYangon`; // Updated timezone

  const response = await fetch(url);
  const data = await response.json();

  // Get current hour in Myanmar time
  const now = new Date();
  const options = {
    timeZone: "Asia/Yangon",
    hour: "numeric",
    hour12: false,
  };
  const currentHour = parseInt(now.toLocaleString("en-US", options));

  // Format daily dates to DD/MM/YYYY
  if (data.daily?.time) {
    data.daily.time = data.daily.time.map((date) =>
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );
  }

  // Round temperature values
  if (data.daily) {
    ["temperature_2m_max", "temperature_2m_min"].forEach((key) => {
      if (data.daily[key]) {
        data.daily[key] = data.daily[key].map((temp) => Math.round(temp));
      }
    });
  }

  // Add current temperature
  if (data.hourly?.temperature_2m) {
    data.current_temperature = Math.round(
      data.hourly.temperature_2m[currentHour] // Now uses Myanmar hour
    );

    // Get specific times (already in Myanmar time)
    data.daily_temperatures = {
      "7am": Math.round(data.hourly.temperature_2m[7]),
      "9am": Math.round(data.hourly.temperature_2m[9]),
      "12pm": Math.round(data.hourly.temperature_2m[12]),
      "3pm": Math.round(data.hourly.temperature_2m[15]),
      "7pm": Math.round(data.hourly.temperature_2m[19]),
    };
  }
  delete data.hourly;

  return data;
}

module.exports = { getWeatherData };
