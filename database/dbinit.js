const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./games.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT,
        release_year INTEGER,
        developer TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating the Games table:', err.message);
        } else {
            console.log('Games table created successfully!');
        }
    });

    db.run(`INSERT INTO Games (title, genre, release_year, developer) VALUES 
        ('The Legend of Zelda', 'Action-Adventure', 1986, 'Nintendo'),
        ('Minecraft', 'Sandbox', 2011, 'Mojang Studios')`, (err) => {
        if (err) {
            console.error('Error inserting initial data:', err.message);
        } else {
            console.log('Initial data inserted into the Games table!');
        }
    });
});

db.close();
