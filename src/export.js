const fs = require("fs");
const path = require("path");
const { getWeatherData } = require("./weather");
const { cities } = require("./cities");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function exportWeatherData() {
  console.log(`Fetching weather data for ${cities.length} cities...\n`);
  const weatherData = [];

  for (const city of cities) {
    try {
      process.stdout.write(`Fetching ${city.name}...`);
      const data = await getWeatherData(city.latitude, city.longitude);
      weatherData.push({
        city: city.name,
        data,
      });
      console.log(" ✓");
      await delay(300);
    } catch (error) {
      console.log(` ✗ (${error.message})`);
    }
  }

  const filePath = path.join(__dirname, "..", "weather_data.json");
  fs.writeFileSync(filePath, JSON.stringify(weatherData, null, 2));

  console.log(`\n✅ Done! Saved ${weatherData.length} cities to weather_data.json`);
}

exportWeatherData().catch(console.error);
