const express = require('express');
const { addLocation, getSunriseSunset } = require('../controller/weatherController');
const router = express.Router();

//route to add location
router.post('/location', addLocation);
//route to get location data
router.get('/location/:lat/:lon', getSunriseSunset);

module.exports = router;
