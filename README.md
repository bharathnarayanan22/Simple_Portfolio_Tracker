# Simple Portfolio Tracker

## Backend

### Requirements
- **Java**: Ensure you have Java 17 or a compatible version installed.
- **Maven**: Used for building and managing the project.
- **Spring Boot**: For building the backend REST API.
- **MySQL**: For storing stock portfolio data, user information, and transaction details.

Check for the versions used in the backend in the `pom.xml` file. If you have different versions, make sure to change them accordingly.

### Backend Configuration

The backend uses **Spring Boot** and connects to a **MySQL database** hosted on **Railway**. Below are the configuration details:

- **Database URL**: `jdbc:mysql://autorack.proxy.rlwy.net:59794/railway`
- **Database Username**: `root`
- **Database Password**: `nzJPRjZKyEVNaTvIDiaPrbbCULmhgPLH`

The database contains mock data for stocks, and the system also includes code for dynamically updating stock prices over time.

#### Mysql LocalHost Configuration

- **Database URL**: `jdbc:mysql://localhost:3306/portfolio_tracker`
- **Database Username**: `<Your Username>`
- **Database Password**: `<Your Password>`

These Changes can be done in the following
- `application.properties` file in the `src/main/resources` directory.

Use the following query to insert a mock stock database
`INSERT INTO stocks (stock_name, ticker, volume, price) VALUES
('Apple Inc.', 'AAPL', 150, 145.32),
('Microsoft Corporation', 'MSFT', 200, 310.24),
('Amazon.com Inc.', 'AMZN', 100, 125.89),
('Tesla Inc.', 'TSLA', 300, 652.81),
('Alphabet Inc.', 'GOOGL', 250, 2814.00),
('Meta Platforms Inc.', 'META', 180, 267.92),
('NVIDIA Corporation', 'NVDA', 120, 195.10),
('Netflix Inc.', 'NFLX', 90, 512.85),
('Intel Corporation', 'INTC', 400, 54.32),
('Cisco Systems Inc.', 'CSCO', 320, 56.22),
('Oracle Corporation', 'ORCL', 250, 98.43),
('Adobe Inc.', 'ADBE', 110, 460.58),
('Salesforce Inc.', 'CRM', 190, 218.39),
('PayPal Holdings Inc.', 'PYPL', 220, 194.47),
('Zoom Video Communications', 'ZM', 180, 150.62),
('Shopify Inc.', 'SHOP', 140, 163.90),
('Snap Inc.', 'SNAP', 500, 35.50),
('Twitter Inc.', 'TWTR', 300, 41.88),
('Qualcomm Inc.', 'QCOM', 170, 133.56),
('AMD Inc.', 'AMD', 230, 108.94);
`
Us this qery in your Mysql cmd line

### To Run Backend

- Clone the repository
- use cmd `cd backend` to get into the backend
- use cmd `mvn spring-boot:run` to run the backend

## Frontend

### Requirements
- **Node.js**: Ensure you have Node.js installed.
- **npm**: Used for managing frontend dependencies.
- **React**: For building the frontend application.

### Frontend Configuration
The frontend uses **React** and connects to the backend API hosted on **Render**.

- **Backend API URL for Localhost**: `http://localhost:8080/`
- **Backend API URL for Render**: `https://portfolio-tracker-frontend.onrender.com/`

### To Run Frontend
- Clone the repository
- use cmd `cd frontend` to get into the frontend
- use cmd `npm install` to install the frontend dependencies
- use cmd `npm run dev` to run the frontend