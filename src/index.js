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

app.get("/api/export-weather", async (req, res) => {
  try {
    const weatherData = await Promise.all(
      cities.map(async (city) => {
        const data = await getWeatherData(city.latitude, city.longitude);
        return {
          city: city.name,
          data,
        };
      })
    );

    // Save to project directory
    const projectPath = path.join(__dirname, "..");
    const filePath = path.join(projectPath, "weather-data-hourly.json");

    fs.writeFileSync(filePath, JSON.stringify(weatherData, null, 2));

    res.json({
      message: "Weather data exported successfully to project root directory",
    });
  } catch (error) {
    console.error("Error exporting weather data:", error);
    res.status(500).json({ error: "Failed to export weather data" });
  }
});

app.listen(port, () => {
  console.log(`Weather API server running on port ${port}`);
});
