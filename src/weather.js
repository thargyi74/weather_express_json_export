const fetch = require('node-fetch');

async function getWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=GMT`;

  const response = await fetch(url);
  const data = await response.json();

  // Get current hour
  const now = new Date();
  const currentHour = now.getHours();

  // Format daily dates
  // if (data.daily && data.daily.time) {
  //   data.daily.time = data.daily.time.map((date) =>
  //     new Date(date).toLocaleDateString("en-US", { weekday: "short" })
  //   );
  // }

  // Format daily dates to DD/MM/YYYY
  if (data.daily && data.daily.time) {
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
    if (data.daily.temperature_2m_max) {
      data.daily.temperature_2m_max = data.daily.temperature_2m_max.map(
        (temp) => Math.round(temp)
      );
    }
    if (data.daily.temperature_2m_min) {
      data.daily.temperature_2m_min = data.daily.temperature_2m_min.map(
        (temp) => Math.round(temp)
      );
    }
  }

  // Add current temperature
  if (data.hourly && data.hourly.temperature_2m) {
    data.current_temperature = Math.round(
      data.hourly.temperature_2m[currentHour]
    );

    // Get specific times
    data.daily_temperatures = {
      "7am": Math.round(data.hourly.temperature_2m[7]),
      "9am": Math.round(data.hourly.temperature_2m[9]),
      "12pm": Math.round(data.hourly.temperature_2m[12]),
      "7pm": Math.round(data.hourly.temperature_2m[19]),
    };
  }
  delete data.hourly;

  return data;
}

module.exports = {
  getWeatherData
};