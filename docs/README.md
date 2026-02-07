---
layout: home
permalink: index.html
repository-name: e22-co2060-Crop-Yield-Optimization-and-Intelligent-Plant-Disease-Analysis
title: Agriconnect
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Agriconnect

---

## Team
- E/22/130, S. H. S. Hansara, [email](mailto:e22130@eng.pdn.ac.lk) 
- E/22/008, T. H. Abeywickrama, [email](mailto:e22008@eng.pdn.ac.lk) 
- E/22/126, H. P. J. Gunawardhana, [email](mailto:e22126@eng.pdn.ac.lk) 
- E/22/135, H. T. D. Hatharasinghe, [email](mailto:e22135@eng.pdn.ac.lk) 

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

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

## Software Designs

(TODO: Detailed designs with many sub-sections)

## Testing

(TODO: Testing done on software : detailed + summarized results)

## Conclusion

(TODO: What was achieved, future developments, commercialization plans)

## Links

- [Project Repository](https://github.com/cepdnaclk/e22-co2060-Crop-Yield-Optimization-and-Intelligent-Plant-Disease-Analysis){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/e22-co2060-Crop-Yield-Optimization-and-Intelligent-Plant-Disease-Analysis){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
