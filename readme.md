# Django Chat Application

## Overview

The Chat Project is a Django-based web application that allows users to communicate in real-time through chat rooms. It utilizes Django Channels for handling WebSocket connections, enabling asynchronous communication.

## Features

- User authentication (registration, login, logout)
- Real-time chat functionality
- Multiple chat rooms
- User presence indicators
- Responsive design

## Technologies Used

- Django
- Django Channels
- PostgreSQL
- Python
- HTML/CSS/JavaScript
- Whitenoise (for serving static files)

## Installation

### Prerequisites

- Python 3.x
- PostgreSQL
- pip (Python package installer)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ravix007/chat_project.git
   cd chat_project
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the required packages:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file:**

   Create a `.env` file in the project root and add your database credentials:

   ```plaintext
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   ```

5. **Run database migrations:**

   ```bash
   python manage.py migrate
   ```

6. **Create the static files:**

   ```bash
    python manage.py collectstatic --noinput
   ```

7. **Run the following command to start Application:**

   ```bash
    python -m daphne chat_project.asgi:application -b 0.0.0.0 -p 8000
   ```

8. **Access the application:**

   Open your web browser and go to `http://127.0.0.1:8000/`.

## Usage

- Register a new account or log in with an existing account.
- Join a chat room after logging with one id on a browser and login with a second id on another browser then select the username used for signin and start chatting
