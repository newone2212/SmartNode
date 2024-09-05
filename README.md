# SmartNode
# Weather Data System with Personalized Greetings

## Overview

This project implements a weather data system that retrieves and stores weather data, including sunrise and sunset times, for multiple locations. It also provides personalized greetings (Good morning, Good afternoon, Good evening) based on the location's current time.

## Features

1. **Personalized Greetings**: The system generates a greeting message based on the location's time (Good morning, Good afternoon, or Good evening).
2. **Weather Data Storage**: The system retrieves 5 days of weather data from third-party APIs and stores it in a MongoDB database.
3. **Automated Data Retrieval**: Weather data is updated every 24 hours using a cron job.
4. **Data Cleanup**: Old data (older than 5 days) is automatically removed from the database.
5. **Sunrise and Sunset Tracking**: For each location, the system tracks and stores sunrise and sunset times.

## Installation

1. Clone the repository:

   ```bash
   git clone [https://github.com/yourusername/weather-data-system.git](https://github.com/newone2212/SmartNode)
