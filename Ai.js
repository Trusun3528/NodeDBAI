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
        // Dynamically retrieve the database schema
        const schemaQuery = `
            SELECT name, sql 
            FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%';
        `;

        db.all(schemaQuery, [], async (err, tables) => {
            if (err) {
                return res.status(500).send(`Failed to retrieve database schema: ${err.message}`);
            }

            // Construct the schema description
            const schemaDescription = tables.map(table => table.sql).join('\n\n');

            // Check if the user query is asking for a list of schemas
            if (userQuery.toLowerCase().includes('list schemas')) {
                const schemaList = tables.map(table => table.name).join(', ');
                return res.json({
                    message: 'List of schemas retrieved successfully',
                    schemas: schemaList,
                });
            }

            // Include the schema in the AI prompt
            const aiPrompt = `
            The database has the following schema:
            ${schemaDescription}

            Generate a valid SQLite query based on the user's request. 
            Only return the SQL query and nothing else.

            User request: ${userQuery}
            SQL query:
            `;

            try {
                const aiResponse = await getAIResponse(aiPrompt);

                // Parse the AI's response to extract the SQL query
                const sqlQuery = aiResponse.trim();

                // Determine the type of query (SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP)
                const queryType = sqlQuery.split(' ')[0].toLowerCase();

                if (queryType === 'select') {
                    // Handle SELECT queries
                    db.all(sqlQuery, [], (err, rows) => {
                        if (err) {
                            return res.status(500).send(`Database error: ${err.message}`);
                        }
                        res.json({
                            message: 'Query executed successfully',
                            data: rows, // Return the retrieved rows
                        });
                    });
                } else if (['insert', 'update', 'delete'].includes(queryType)) {
                    // Handle INSERT, UPDATE, DELETE queries
                    db.run(sqlQuery, function (err) {
                        if (err) {
                            return res.status(500).send(`Database error: ${err.message}`);
                        }
                        res.json({
                            message: 'Query executed successfully',
                            changes: this.changes, // Number of rows affected
                        });
                    });
                } else if (['create', 'alter', 'drop'].includes(queryType)) {
                    // Handle CREATE, ALTER, DROP queries
                    db.run(sqlQuery, function (err) {
                        if (err) {
                            return res.status(500).send(`Database error: ${err.message}`);
                        }
                        res.json({
                            message: 'Schema modification executed successfully',
                        });
                    });
                } else {
                    res.status(400).send('Unsupported query type.');
                }
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
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
                model: "llama-3.2-3b-instruct", // Replace with the actual model name from LM Studio
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
