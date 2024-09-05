const axios = require('axios');
const Weather = require('../models/weatherModel');
require('dotenv').config();


const API_HOST_WEATHER = process.env.API_HOST_WEATHER;
const API_KEY_WEATHER = process.env.API_KEY_WEATHER;

const API_HOST_ASTRO = process.env.API_HOST_WEATHER;
const API_KEY_ASTRO = process.env.API_KEY_WEATHER;

// const API_HOST = process.env.API_HOST;
// const API_KEY = process.env.API_KEY;
const getGreeting = (sunrise, sunset, timezone) => {
  const now = moment().tz(timezone);
  const sunriseTime = moment.unix(sunrise).tz(timezone);
  const sunsetTime = moment.unix(sunset).tz(timezone);

  if (now.isBefore(sunriseTime)) {
    return 'Good morning!';
  } else if (now.isBetween(sunriseTime, sunsetTime)) {
    return 'Good afternoon!';
  } else {
    return 'Good evening!';
  }
};



module.exports = {
  //api for greating 
  GreatingUserSetup:async (req, res) => {
    const { lat, lon } = req.query;
  
    try {
      const response = await axios.get('https://open-weather13.p.rapidapi.com/city/latlon/' + lat + '/' + lon, {
        headers: {
          'x-rapidapi-host': process.env.API_HOST,
          'x-rapidapi-key':  process.env.API_KEY
        }
      });
  
      const { sunrise, sunset, timezone } = response.data.sys;
      const localTimezone = moment.tz.guess(); // Get local timezone
      const greeting = getGreeting(sunrise, sunset, localTimezone);
  
      res.json({ message: greeting });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve data from API' });
    }
  },
  // api to add new location and get weather data
  addLocation: async (req, res) => {
    try {
      const { lat, lon, timezone } = req.body;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 1);

      // Fetch weather data
      const weatherDataList = [];
      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        const formattedDate = date.toISOString().split('T')[0];
        console.log(formattedDate);
        const weatherUrl = `https://${API_HOST_WEATHER}/time_machine?lat=${lat}&lon=${lon}&date=${formattedDate}&units=auto`;
        const weatherResponse = await axios.get(weatherUrl, {
          headers: {
            'x-rapidapi-host': API_HOST_WEATHER,
            'x-rapidapi-key': API_KEY_WEATHER,
          },
        });
        weatherDataList.push(...weatherResponse.data.data);
      }
      console.log(weatherDataList);
      // Fetch sunrise and sunset times
      const astroUrl = `https://${API_HOST_ASTRO}/astro?lat=${lat}&lon=${lon}&timezone=auto`;
      const astroResponse = await axios.get(astroUrl, {
        headers: {
          'x-rapidapi-host': API_HOST_ASTRO,
          'x-rapidapi-key': API_KEY_ASTRO,
        },
      });

      const astroDataList = astroResponse.data.astro.data;
      // console.log(astroDataList);

      // Remove existing weather data for the same location
      await Weather.deleteMany({
        'location.lat': lat,
        'location.lon': lon,
      });
      // console.log("Deleted")
      // Save new weather data
      weatherDataList.filter(async (forecast) => {
        const date = new Date(forecast.date).toISOString().split('T')[0];
        // console.log('Processing Date:', date);

        const astroForDate = astroDataList.find(d => d.day === date);
        // console.log('Astro For Date:', astroForDate);

        if (!astroForDate) {
          console.log('No astro data for this date, skipping...');

        } else {

          const weatherData = new Weather({
            location: { lat, lon },
            dateTime: new Date(forecast.date),
            weather: forecast.weather,
            summary: forecast.summary,
            icon: forecast.icon,
            temperature: forecast.temperature,
            feels_like: forecast.feels_like,
            wind_chill: forecast.wind_chill,
            dew_point: forecast.dew_point,
            wind: forecast.wind,
            cloud_cover: forecast.cloud_cover,
            pressure: forecast.pressure,
            precipitation: forecast.precipitation,
            ozone: forecast.ozone,
            humidity: forecast.humidity,
            sunrise: astroForDate ? new Date(astroForDate.sun.rise) : null,
            sunset: astroForDate ? new Date(astroForDate.sun.set) : null
          });

          await weatherData.save();
        }
      })

      await res.json({ message: 'Weather and astro data updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve weather and astro data' });
    }
  },
  //retrive data from db
  getSunriseSunset : async (req, res) => {
    const { lat, lon } = req.params;
  
    try {
      // Fetch weather data from the last 5 days
      const data = await Weather.find({
        'location.lat': lat,
        'location.lon': lon,
        createdAt: { $gte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      });
  
      // If data is available
      if (data.length > 0) {
        // Group by date and ensure unique sunrise and sunset times
        const uniqueData = data.reduce((acc, entry) => {
          const date = new Date(entry.dateTime).toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // Only add unique sunrise and sunset times for each date
          if (!acc[date]) {
            acc[date] = {
              date,
              sunrise: entry.sunrise,
              sunset: entry.sunset
            };
          }
          return acc;
        }, {});
  
        // Convert grouped data to an array, sort by date, and get the most recent two days
        const sortedData = Object.values(uniqueData)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2); // Get only the most recent two days
  
        // Respond with the filtered and sorted data
        res.json({ weatherData: sortedData });
      } else {
        res.status(404).json({ error: 'No data found for the specified location and time range' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving data' });
    }
  },
};
