# Final Project

**Project Type:** Solo Project  
**Student:** Kenneth
**Date:** December 2025

## 📖 Project Overview

This repository contains a collection of four interactive web applications developed as part of the ELEC3 final project. Each application demonstrates different aspects of web development, including DOM manipulation, API integration, event handling, and responsive design. All projects are built using vanilla JavaScript, HTML, and CSS without any frameworks.

---

## ✨ Main Features

This project portfolio includes four distinct web applications:

### 1. **Calculator**
- Clean, minimal calculator interface with keyboard support
- Performs basic arithmetic operations (+, −, ×, ÷)
- Expression-based calculation engine
- Responsive button grid layout
- Keyboard shortcuts for enhanced usability

### 2. **Stopwatch**
- High-precision timer with millisecond accuracy
- Start, stop, lap, and reset functionality
- Keyboard shortcuts (Space, L, R)
- Lap time recording with history
- Clean, readable time display (HH:MM:SS:MS)

### 3. **The Meal DB - Recipe Finder**
- Search thousands of recipes by name
- Random meal generator for inspiration
- Detailed recipe view with ingredients and instructions
- Dark/light theme toggle
- Responsive grid layout
- Persistent theme preference using localStorage

### 4. **Weather App (SkyCast)**
- Real-time weather data for any city worldwide
- 5-day weather forecast
- Current conditions including temperature, humidity, wind, and pressure
- Dynamic weather icons
- Dark/light theme support
- Responsive design

---

## 🔌 APIs Used

### TheMealDB API
- **Base URL:** `https://www.themealdb.com/api/json/v1/1`
- **Endpoints:**
  - `/search.php?s={query}` - Search meals by name
  - `/random.php` - Get a random meal
- **Parameters:**
  - `s` - Search term (meal name)
- **Authentication:** None required (free tier)
- **Documentation:** [TheMealDB API Docs](https://www.themealdb.com/api.php)

### OpenWeatherMap API
- **Base URL:** `https://api.openweathermap.org/data/2.5`
- **Endpoints:**
  - `/weather?q={city}&appid={API_KEY}&units=metric` - Current weather
  - `/forecast?q={city}&appid={API_KEY}&units=metric` - 5-day forecast
- **Parameters:**
  - `q` - City name
  - `appid` - API key (required)
  - `units` - Temperature units (metric for Celsius)
- **Authentication:** API key required (included in project)
- **Documentation:** [OpenWeatherMap API Docs](https://openweathermap.org/api)

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Styling, animations, and responsive design
  - CSS Grid and Flexbox for layouts
  - CSS Custom Properties (variables) for theming
  - Media queries for mobile responsiveness
- **JavaScript (ES6+)** - Application logic and interactivity
  - Fetch API for HTTP requests
  - DOM manipulation
  - Event handling
  - LocalStorage for data persistence
  - Async/await for API calls
- **No frameworks or libraries** - Pure vanilla JavaScript

---

## 📥 How to Run the Project

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor (optional, for viewing code)
- Internet connection (required for API-based projects)

### Step-by-Step Instructions

#### Option 1: Clone the Repository
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project folder
cd final-project-elec3
```

#### Option 2: Download as ZIP
1. Click the "Code" button on the repository page
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location

### Running Individual Projects

Each project is self-contained in its own folder. To run any project:

1. **Navigate to the project folder:**
   ```bash
   cd calculator    # or stopwatch, the-meal-db, weather-api
   ```

2. **Open the `index.html` file:**
   - **Method 1:** Double-click the `index.html` file in your file explorer
   - **Method 2:** Right-click → Open with → Your preferred browser
   - **Method 3:** Use a local development server (recommended):
     ```bash
     # If you have Python installed:
     python -m http.server 8000
     
     # Then open: http://localhost:8000
     ```

3. **For VS Code users:**
   - Install the "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"

### Testing Each Project

- **Calculator:** Try entering expressions using the on-screen buttons or your keyboard
- **Stopwatch:** Use the control buttons or keyboard shortcuts (Space, L, R)
- **The Meal DB:** Search for a meal name (e.g., "pasta", "chicken") or click "Random Meal"
- **Weather App:** Enter a city name (e.g., "London", "Tokyo") and click Search

---

## 📁 Project Structure

```
final-project-elec3/
│
├── calculator/
│   ├── index.html          # Calculator HTML structure
│   ├── script.js           # Calculator logic
│   └── style.css           # Calculator styles
│
├── stopwatch/
│   ├── index.html          # Stopwatch HTML structure
│   ├── script.js           # Timer logic
│   └── style.css           # Stopwatch styles
│
├── the-meal-db/
│   ├── index.html          # Recipe finder HTML
│   ├── script.js           # API integration and logic
│   └── style.css           # Recipe finder styles
│
├── weather-api/
│   ├── index.html          # Weather app HTML
│   ├── script.js           # Weather API integration
│   └── style.css           # Weather app styles

---

## 💡 Key Learning Outcomes

Through this project, I developed skills in:

- **DOM Manipulation:** Dynamically updating page content based on user interactions
- **API Integration:** Making HTTP requests and handling JSON responses
- **Event Handling:** Managing user input from various sources (clicks, keyboard)
- **State Management:** Using localStorage for persistent data
- **Responsive Design:** Creating layouts that work on different screen sizes
- **Asynchronous JavaScript:** Using Promises and async/await
- **Error Handling:** Gracefully managing API failures and user errors
- **CSS Theming:** Implementing dark/light mode with CSS variables

---

## 🎯 Future Enhancements

Potential improvements for future versions:

- **Calculator:** Scientific mode with advanced functions
- **Stopwatch:** Export lap times to CSV
- **The Meal DB:** Save favorite recipes locally, filter by category
- **Weather App:** Geolocation support, weather alerts, hourly forecast

---

## 📚 Credits & Attribution

### APIs
- **TheMealDB:** Free meal database API - [themealdb.com](https://www.themealdb.com/)
- **OpenWeatherMap:** Weather data API - [openweathermap.org](https://openweathermap.org/)

### Resources
- Weather icons provided by OpenWeatherMap
- Meal images provided by TheMealDB

### Development
- All code written by Kenneth as part of ELEC3 coursework
- Developed using vanilla JavaScript, HTML, and CSS
- No external libraries or frameworks used

---

## 📄 License

This project is submitted as coursework for educational purposes.

---

## 👤 Author

**Kenneth C. Escano**  
ELEC3 Student  
December 2025

---

**Thank you for reviewing my project!** 🚀
