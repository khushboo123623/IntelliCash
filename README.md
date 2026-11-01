# IntelliCash – AI-Powered ATM Cash Intelligence

An intelligent ATM cash demand forecasting and monitoring platform designed to help financial institutions predict cash requirements, monitor ATM networks, and make data-driven cash replenishment decisions.

## Overview

IntelliCash is a full-stack AI-powered application that analyzes historical ATM transaction patterns and predicts future cash demand.

The platform provides a centralized dashboard for monitoring ATM performance, exploring transaction data, viewing demand predictions, analyzing risk levels, and managing cash replenishment recommendations.

The project aims to help reduce ATM cash-out incidents, improve cash availability, and support efficient cash management.

## Problem Statement

ATMs require sufficient cash availability to meet customer withdrawal demands. However, poor cash planning can lead to:

- Unexpected ATM cash shortages.
- Inefficient cash replenishment.
- Increased operational costs.
- Difficulty monitoring multiple ATM locations.
- Limited visibility into future cash requirements.

Traditional cash management approaches may not adequately account for historical demand patterns and changing withdrawal behavior.

## Proposed Solution

IntelliCash uses historical transaction data and machine learning-based forecasting to estimate future ATM cash demand.

It provides an integrated dashboard where users can:

- Monitor ATM network information.
- Generate cash demand predictions.
- Analyze actual versus predicted demand.
- Identify ATMs with different risk levels.
- Review cash replenishment recommendations.
- Explore transaction and engineered feature data.
- Track historical predictions and model performance.

## Key Features

### 1. Dashboard Overview
- View important ATM network statistics.
- Monitor cash demand and prediction trends.
- Identify ATMs requiring attention.
- View network risk distribution.

### 2. ATM Network Management
- Explore ATM information.
- Filter ATMs using available criteria.
- View ATM-specific details.
- Monitor ATM location and cash balance information.

### 3. AI-Based Cash Demand Prediction
- Select an ATM.
- Generate cash demand forecasts.
- View predicted demand and related metrics.
- Review historical demand trends.

### 4. Refill Actions
- View cash replenishment recommendations.
- Filter recommendations by risk, status, and city.
- Review pending recommendations.
- Navigate to individual ATM details.

### 5. Analytics and Insights
- Mean Absolute Error (MAE).
- Root Mean Squared Error (RMSE).
- R² Score.
- Prediction accuracy.
- Actual versus predicted demand visualization.
- Risk distribution analysis.
- High-demand ATM analysis.

### 6. Data Explorer
- Explore ATM transaction records.
- View engineered features.
- Filter records by ATM.
- Search transaction information.

### 7. Prediction History
- Review previously generated predictions.
- Search and filter prediction records.
- View prediction details and feature snapshots.

### 8. User Settings
- Manage profile information.
- Change account password.
- View system information.
- Configure available local preferences.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI Styling | CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Python, FastAPI |
| Machine Learning | Scikit-learn |
| Data Processing | Pandas |
| Database | SQLite |
| API Documentation | FastAPI / Swagger UI |
| Development Tools | VS Code, Git, GitHub |

## System Architecture

```text
             USER
               |
               v
       REACT FRONTEND
       (TypeScript + Vite)
               |
               v
          REST API
          (FastAPI)
               |
       +-------+-------+
       |       |       |
       v       v       v
    DATABASE  ML MODEL  DATA PROCESSING
    (SQLite)  (Scikit-  (Pandas)
              learn)
       |       |       |
       +-------+-------+
               |
               v
       FORECASTING RESULTS
               |
               v
       INTELLICASH DASHBOARD
```

## Project Structure

```text
IntelliCash/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   └── package.json
│
├── server/
│   ├── app/
│   ├── data/
│   ├── models_storage/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
├── .env.example
└── README.md
```

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Python 3.11
- Node.js and npm
- Visual Studio Code
- Git

### 1. Clone the Repository

```bash
git https://github.com/khushboo123623/IntelliCash.git
```

Move into the project directory:

```bash
cd IntelliCash
```

### 2. Backend Setup

Open a terminal:

```bash
cd server
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
python -m pip install "uvicorn[standard]"
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend URL:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/api/docs

### 3. Frontend Setup

Open a second terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

http://localhost:5173

**Note:** Keep both frontend and backend terminals running while using the application. Configure the environment variables using the provided `.env.example` files according to your local setup.

## Machine Learning and Forecasting

IntelliCash uses historical ATM transaction information and engineered features to support cash demand forecasting.

The forecasting workflow involves:

1. Collecting historical transaction data.
2. Processing and cleaning the data.
3. Extracting useful time-based features.
4. Using historical demand patterns.
5. Generating cash demand predictions.
6. Evaluating model performance using appropriate metrics.

The model evaluation metrics include:

- MAE – Measures average absolute prediction error.
- RMSE – Measures prediction error while penalizing larger errors.
- R² Score – Indicates how much variation in the target is explained by the model.
- Prediction Accuracy – Displays the evaluation result reported by the backend.

## Future Enhancements

- Integration with real-time ATM transaction feeds.
- Advanced forecasting models.
- Automated cash replenishment scheduling.
- Explainable AI for prediction insights.
- Interactive geographical ATM monitoring.
- Cloud deployment.
- Advanced alert and notification system.

## Project Purpose

This project demonstrates the application of machine learning, data analytics, and full-stack web development to a practical financial operations problem.

It combines predictive analytics with an interactive dashboard to support smarter ATM cash management.

## Author

**Developed as an academic project.**

## License

Refer to the repository's applicable license and original source project terms before redistributing or modifying third-party components.
