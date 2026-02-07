# AGRICONNECT
e22-co2060-Crop-Yield-Optimization-and-Intelligent-Plant-Disease-Analysis

## Introduction

The Sri Lankan rice market is influenced by the "Rice Mafia", a cartel of large-scale millers who hoard stocks to create artificial shortages and manipulate prices. Farmers are forced to sell to monopolistic large scale mills due to immediate financial needs. Also, there are no methods currently to track the crop production islandwide and promote higher yields on a large scale through subsidies. Additionally, slow manual identification of plant diseases leads to preventable island-wide crop losses.

This project introduces a platform to reduce price monopolies by encouraging government-channel sales through a performance-based incentive system. It utilizes an AI-driven neural network for early disease detection via photo uploads and generates a real-time disease spread heatmap.

Solving this problem will ensure fair rice prices for consumers and provide farmers with objective benchmarks and performance-based subsidies. Pre-emptive action against disease outbreaks becomes possible, protecting national food security.

## Solution Architecture

The system follows a modern web architecture to handle data processing and AI analysis:
- Frontend: Developed using React (HTML, CSS, JS) to provide a dashboard for farmers to track points and an interface for uploading plant images.
- Backend: Built with Express.js, managing the central logic for productivity comparisons and the points-based incentive system.
- Database: Utilizes MongoDB to store farmer data, harvest records, and GPS-tagged disease locations.
- AI Engine: A Python-based ML model using OpenCV processes uploaded images to identify diseases in paddy and other major crops.
