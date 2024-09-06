const express = require('express');
const { addLocation, getSunriseSunset,greetingUser } = require('../controller/weatherController');
const router = express.Router();

//route to add location
router.post('/location', addLocation);
//route to get location data
router.get('/location/:lat/:lon', getSunriseSunset);
//route for greatting
router.get('/Greet/:lat/:lon', greetingUser);

module.exports = router;
