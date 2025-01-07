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