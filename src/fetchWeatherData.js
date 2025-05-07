const fs = require('fs');
const path = require('path');
const https = require('https');

// City data with their API codes
const cities = [
  { name: 'Yangon', code: 'svu48352c85' },
  { name: 'Mandalay', code: 'svu4stb968e' },
  { name: 'Myitkyina', code: 'svu4w9def05' },
  { name: 'Monywa', code: 'svu50a0b5ca' },
  { name: 'Taunggyi', code: 'svu50p6383d' },
  { name: 'Sittwe', code: 'svu51aecb4f' },
  { name: 'Magway', code: 'svu51oded02' },
  { name: 'Loikaw', code: 'svu52f71cd2' },
  { name: 'Bago', code: 'svu52tefc8d' },
  { name: 'Pathein', code: 'svu535a8281' },
  { name: 'Hpa-an', code: 'svu535a8281' },
  { name: 'Mawlamyine', code: 'svu54xb1111' },
  { name: 'Dawei', code: 'svu55bcc549' }
];

// Helper function for HTTP requests using promises
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(`Error parsing JSON: ${error.message}`);
        }
      });
      
    }).on('error', (error) => {
      reject(`Error fetching data: ${error.message}`);
    });
  });
}

// Main function to fetch all weather data
async function fetchAllWeatherData() {
  const baseUrl = 'https://www.vplus.es/weather/json/weather.php?q=';
  const allData = [];
  
  console.log('Starting to fetch weather data for all cities...');
  
  for (const city of cities) {
    const url = `${baseUrl}${city.code}`;
    try {
      console.log(`Fetching data for ${city.name}...`);
      const weatherData = await fetchData(url);
      
      // Format the data with city name
      allData.push({
        city: city.name,
        data: weatherData
      });
      
      console.log(`Successfully fetched data for ${city.name}`);
    } catch (error) {
      console.error(`Failed to fetch data for ${city.name}: ${error}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allData;
}

// Function to save data to file
function saveToFile(data, filePath) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString);
    console.log(`Data successfully saved to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving data to file: ${error}`);
    return false;
  }
}

// Execute if this file is run directly
if (require.main === module) {
  const outputPath = path.join(__dirname, '../weather_data_updated.json');
  
  fetchAllWeatherData()
    .then(data => {
      console.log(`Successfully fetched data for ${data.length} cities`);
      saveToFile(data, outputPath);
    })
    .catch(error => {
      console.error('Error in fetching weather data:', error);
    });
}

// Export functions for use in other files
module.exports = {
  fetchAllWeatherData,
  saveToFile
};