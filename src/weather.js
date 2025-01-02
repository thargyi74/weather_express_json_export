const fetch = require('node-fetch');

async function getWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=GMT`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Format the dates to days of the week
  if (data.daily && data.daily.time) {
    data.daily.time = data.daily.time.map(date => 
      new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    );
  }
  
  return data;
}

module.exports = {
  getWeatherData
};