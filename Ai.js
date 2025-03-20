const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const axios = require('axios'); 
const path = require('path'); 

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 

const db = new sqlite3.Database('./games.db');

app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});


app.post('/ai-query', async (req, res) => {
    const userQuery = req.body.query;

    try {
      
        const aiPrompt = `
        The database has a table named "Games" with the following columns:
        - id (INTEGER, Primary Key, Auto Increment)
        - title (TEXT, NOT NULL)
        - genre (TEXT)
        - release_year (INTEGER)
        - developer (TEXT)

        Generate a valid SQL query based on the user's request. 
        Only return the SQL query and nothing else.

        User request: ${userQuery}
        SQL query:
        `;

        const aiResponse = await getAIResponse(aiPrompt);

        //Parse the AI's response to extract the SQL query
        const sqlQuery = aiResponse.trim();

        //Determine the type of query (SELECT, INSERT, UPDATE, DELETE)
        if (sqlQuery.toLowerCase().startsWith('select')) {
            //Handle SELECT queries
            db.all(sqlQuery, [], (err, rows) => {
                if (err) {
                    return res.status(500).send(`Database error: ${err.message}`);
                }
                res.json({
                    message: 'Query executed successfully',
                    data: rows, //Return the retrieved rows
                });
            });
        } else {
            //Handle INSERT, UPDATE, DELETE queries
            db.run(sqlQuery, function (err) {
                if (err) {
                    return res.status(500).send(`Database error: ${err.message}`);
                }
                res.json({
                    message: 'Query executed successfully',
                    changes: this.changes, //Number of rows affected
                });
            });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function getAIResponse(query, retries = 3) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            //Use the correct LM Studio endpoint for completions
            const response = await axios.post('http://localhost:1234/v1/completions', {
                model: "elinas_-_llama-3-13b-instruct-ft", // Replace with the actual model name from LM Studio
                prompt: query,
                max_tokens: 150, // Adjust as needed
                temperature: 0.5, // Lower temperature for more deterministic responses
            });

            //Return the generated text
            return response.data.choices[0].text.trim(); // Adjust based on LM Studio's response structure
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            attempt++;
        }
    }
    throw new Error('Failed to get a valid response from the AI after multiple attempts.');
}

app.listen(3000, () => console.log('Server running on port 3000'));
