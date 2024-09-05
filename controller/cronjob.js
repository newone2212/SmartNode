const cron = require('node-cron');
const axios = require('axios');
const Weather = require('../models/weatherModel'); // Path to your model
const API_HOST_WEATHER = process.env.API_HOST_WEATHER;
const API_KEY_WEATHER = process.env.API_KEY_WEATHER;

const API_HOST_ASTRO = process.env.API_HOST_WEATHER;
const API_KEY_ASTRO = process.env.API_KEY_WEATHER;

cron.schedule('0 0 * * *', async () => {
  try {
    const locations = await Weather.distinct('location');
    
    for (const loc of locations) {
      const { lat, lon } = loc;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 1);

      const weatherDataList = [];

      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        const formattedDate = date.toISOString().split('T')[0];
        const weatherUrl = `https://${API_HOST_WEATHER}/time_machine?lat=${lat}&lon=${lon}&date=${formattedDate}&units=auto`;
        const weatherResponse = await axios.get(weatherUrl, {
          headers: {
            'x-rapidapi-host': API_HOST_WEATHER,
            'x-rapidapi-key': API_KEY_WEATHER,
          },
        });
        weatherDataList.push(...weatherResponse.data.data);
      }

      const astroUrl = `https://${API_HOST_ASTRO}/astro?lat=${lat}&lon=${lon}&timezone=auto`;
      const astroResponse = await axios.get(astroUrl, {
        headers: {
          'x-rapidapi-host': API_HOST_ASTRO,
          'x-rapidapi-key': API_KEY_ASTRO,
        },
      });
      const astroDataList = astroResponse.data.astro.data;

      for (const forecast of weatherDataList) {
        const date = new Date(forecast.date).toISOString().split('T')[0];
        const astroForDate = astroDataList.find(d => d.day === date);

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
          sunset: astroForDate ? new Date(astroForDate.sun.set) : null,
        });

        await weatherData.save();
      }
    }
  } catch (error) {
    console.error('Cronjob failed:', error);
  }
});
