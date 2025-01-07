# Simple_Portfolio_Tracker

# Backend

## Requirements
- **Java**
- **Maven**
- **Spring Boot**: For building the backend REST API.
- **MySQL**: For storing stock portfolio data, user information, and transaction details.

Check for the versions used in the backend in pom.xml file, if you have different versions change the version

## Backend Configuration

The backend uses **Spring Boot** and connects to a **MySQL database** hosted on **Railway**. Below are the configuration details:

- **Database URL**: jdbc:mysql://autorack.proxy.rlwy.net:59794/railway
- **Database Username**: root
- **Database Password**: nzJPRjZKyEVNaTvIDiaPrbbCULmhgPLH

I have mock data for stocks in the database and I have written code for dynamic price change of stocks over time.

## To Run Backend

- Clone the repository
- use cmd `cd backend1` to get into the backend
- use cmd `mvn spring-boot:run` to run the backend