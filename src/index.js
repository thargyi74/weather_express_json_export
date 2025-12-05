const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { getWeatherData } = require("./weather");
const { cities } = require("./cities");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get("/api/export-weather", async (req, res) => {
  try {
    const weatherData = [];

    // Fetch weather data sequentially with delay to avoid API timeouts
    for (const city of cities) {
      console.log(`Fetching weather data for ${city.name}...`);
      const data = await getWeatherData(city.latitude, city.longitude);
      weatherData.push({
        city: city.name,
        data,
      });
      console.log(`✓ ${city.name} done`);
      // Add 500ms delay between requests
      await delay(500);
    }

    // Save to project directory
    const projectPath = path.join(__dirname, "..");
    const filePath = path.join(projectPath, "weather_data.json");

    fs.writeFileSync(filePath, JSON.stringify(weatherData, null, 2));

    res.json({
      message: "Weather data exported successfully to project root directory",
      citiesCount: weatherData.length,
    });
  } catch (error) {
    console.error("Error exporting weather data:", error);
    res.status(500).json({ error: "Failed to export weather data" });
  }
});

app.listen(port, () => {
  console.log(`Weather API server running on port ${port}`);
});
