const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    lat: Number,
    lon: Number,
  },
  dateTime: Date,
  temperature: Number,
  weather: String,
  summary: { type: String },
  icon: { type: Number },
  feels_like: { type: Number },
  wind_chill: { type: Number },
  dew_point: { type: Number },
  wind: {
    speed: { type: Number },
    gusts: { type: Number },
    angle: { type: Number },
    dir: { type: String }
  },
  cloud_cover: { type: Number },
  pressure: { type: Number },
  precipitation: {
    total: { type: Number },
    type: { type: String }
  },
  ozone: { type: Number },
  humidity: { type: Number },
  sunrise: Date,
  sunset: Date,
  timezone: String,  // Store timezone information

  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5d',
  },
});

const Weather = mongoose.model('Weather', weatherSchema);
module.exports = Weather;
