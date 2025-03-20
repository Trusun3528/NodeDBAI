# Node Database AI Usage

Node Database AI Usage is a simple Node.js application that allows users to interact with a SQLite database using natural language queries. The app uses an AI model to generate SQL queries based on user input and executes them on the database.

## Features
- Create and manage a `Games` table in a SQLite database.
- Use natural language to query or modify the database.
- AI-powered SQL query generation.
- Simple web interface for user interaction.

---

## Prerequisites
Before setting up the app, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later)
- [SQLite3](https://www.sqlite.org/)
- [LM Studio](https://lmstudio.ai/) (for running the AI model locally)

---

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd NodeDBAI
   ```

   
2. **Install Dependencies**
   Run the following command to install the required Node.js packages:
   ```
   npm install
   ```


3. **Initialize the Database**
   Run the dbinit.js script to create the Games table and insert initial data:
   ```
   node database/dbinit.js
   ```


4. **Start LM Studio**
   Open LM Studio and ensure the model you want is loaded.
   Start the server on port 1234.
   
5. **Start the Application**
   Start the Node.js server:
    ```
   node Ai.js
   ```


   6. **Access the Web Interface**
    Open your browser and navigate to:
    http://localhost:3000
   


## How To Use Instructions
**How do i use it?**
```
1. Enter a Query:

Use the text box on the web interface to enter a natural language query.
Example: "Show all games released after 2000."

2.Submit the Query:

Click the "Submit" button.
The app will process your query, generate an SQL statement, and execute it on the database.

3. View Results:

For SELECT queries, the results will be displayed in a formatted JSON structure.

For other queries (e.g., INSERT, UPDATE, DELETE), the app will show the number of rows affected.

Example Queries:
"List all games in the database."
"Add a new game titled 'Halo' with genre 'Shooter', released in 2001, developed by 'Bungie'."
"Delete all games released before 1990."

Troubleshooting:
Database Errors: Ensure the games.db file exists in the database folder.

AI Model Issues: Verify that LM Studio is running and accessible at http://localhost:1234.

Port Conflicts: If port 3000 is in use, update the port in Ai.js and restart the server.
```