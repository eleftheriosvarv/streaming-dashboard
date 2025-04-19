Real-Time Travel and Air Quality Dashboard

This project is a real-time web application that displays live data on travel times and air quality in Athens. It includes dynamic visualizations and an interactive map to provide a comprehensive view of conditions across different routes in the city.

Project Structure

backend: FastAPI-based API

frontend: React application using Recharts and Leaflet

docker-compose.yml for local development

README.md

Technologies Used

FastAPI (Python)

React

Recharts

Leaflet

PostgreSQL

Docker

How to Run Locally

Set up your database environment variables in docker-compose.yml

Build and start the containers using: docker-compose up --build

Access the applications at:

Frontend: http://localhost:3000

Backend API: http://localhost:8000/docs

Features

Route selection and day type filters (weekday, weekend, today, yesterday)

Individual bar charts for each metric (driving time, transit time, travel time difference, AQI)

Data auto-refresh every 10 minutes

Interactive map of Athens displaying six unique starting points with the latest values per route

Table view of the latest data update per start point

Clean user interface with conditional rendering based on selected filters

Live Demo

The frontend is available at: https://frontend-dashboard-fyjc.onrender.com/

Author

Developed by Eleftherios Varv
