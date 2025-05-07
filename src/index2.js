const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { fetchAllWeatherData, saveToFile } = require('./fetchWeatherData');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
// Parse JSON requests
app.use(express.json());

// Path to weather data file
const weatherDataPath = path.join(__dirname, '../weather_data_update.json');

// Function to load weather data
function loadWeatherData() {
  try {
    const jsonData = fs.readFileSync(weatherDataPath, 'utf8');
    const data = JSON.parse(jsonData);
    console.log(`Loaded weather data for ${data.length} cities`);
    return data;
  } catch (error) {
    console.error('Failed to load weather data:', error);
    return [];
  }
}

// Initial data load
let weatherData = loadWeatherData();

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Myanmar Weather API',
    endpoints: {
      '/cities': 'Get all available cities',
      '/weather': 'Get weather for all cities',
      '/weather/:city': 'Get weather for a specific city',
      '/weather/:city/current': 'Get current temperature for a specific city',
      '/weather/:city/forecast': 'Get forecast for a specific city',
      '/fetch-latest': 'Fetch fresh data from all sources (admin only)',
    }
  });
});

// Get list of all cities
app.get('/cities', (req, res) => {
  const cities = weatherData.map(item => item.city);
  res.json(cities);
});

// Get weather for all cities
app.get('/weather', (req, res) => {
  res.json(weatherData);
});

// Get weather for a specific city
app.get('/weather/:city', (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const cityData = weatherData.find(item => item.city.toLowerCase() === cityName);
  
  if (!cityData) {
    return res.status(404).json({ error: 'City not found' });
  }
  
  res.json(cityData);
});

// Get current temperature for a specific city
app.get('/weather/:city/current', (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const cityData = weatherData.find(item => item.city.toLowerCase() === cityName);
  
  if (!cityData) {
    return res.status(404).json({ error: 'City not found' });
  }
  
  res.json({
    city: cityData.city,
    current_temperature: cityData.data.current_temperature
  });
});

// Get forecast for a specific city
app.get('/weather/:city/forecast', (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const cityData = weatherData.find(item => item.city.toLowerCase() === cityName);
  
  if (!cityData) {
    return res.status(404).json({ error: 'City not found' });
  }
  
  const { daily } = cityData.data;
  
  res.json({
    city: cityData.city,
    forecast: {
      dates: daily.time,
      weather_codes: daily.weather_code,
      max_temperatures: daily.temperature_2m_max,
      min_temperatures: daily.temperature_2m_min
    }
  });
});

// Endpoint to fetch fresh data (could be protected with authentication in production)
app.get('/fetch-latest', async (req, res) => {
  try {
    // Start the fetch operation
    res.status(202).json({ message: 'Started fetching fresh weather data. This may take a minute.' });
    
    // Fetch new data
    const newData = await fetchAllWeatherData();
    
    if (newData && newData.length > 0) {
      // Save to file
      saveToFile(newData, weatherDataPath);
      
      // Update in-memory data
      weatherData = newData;
      
      console.log('Weather data updated successfully');
    }
  } catch (error) {
    console.error('Error updating weather data:', error);
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing purposes