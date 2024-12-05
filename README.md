# Contest Calendar Scraper

This project is a web scraper that collects contest information from various competitive programming platforms and stores it in a MongoDB database. It also includes a Telegram bot for user notifications.

## Features

- Scrape contest data from multiple platforms (Leetcode, Codechef, Coding Ninjas, GeeksforGeeks, AtCoder)
- Store contest data in MongoDB
- User authentication and management
- Telegram bot for user notifications

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Selenium WebDriver
- Cheerio
- Telegram Bot API
- JWT for authentication

## Setup Instructions

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/contest-calendar-scraper.git
    cd contest-calendar-scraper
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    PORT=3000
    ```

4. **Run the application:**
    ```sh
    npm run dev
    ```

## Project Structure

- `src/`
  - `models/`: Mongoose schemas for MongoDB collections
  - `scraper/`: Scraper scripts for different platforms
  - `routes/`: Express routes for API endpoints
  - `controllers/`: Controller functions for handling requests
  - `middleware/`: Middleware functions for authentication
  - `Bot/`: Telegram bot implementation

## Usage

- **API Endpoints:**
  - `POST /api/auth/signup`: User signup
  - `POST /api/auth/signin`: User signin
  - `PUT /api/auth/changepassword`: Change user password
  - `GET /api/users/getAll`: Get all users
  - `PUT /api/users/edit/:id`: Edit user information
  - `DELETE /api/users/delete/:id`: Delete user
  - `GET /getAllContests`: Get all contests

- **Telegram Bot:**
  - `/start`: Start the bot
  - `/register`: Register your email address to receive notifications

## Contributing

Feel free to submit issues and pull requests for new features, improvements, and bug fixes.
