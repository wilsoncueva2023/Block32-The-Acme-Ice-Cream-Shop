const pg = require ('pg')
const express = require('express')
const app = express()

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'db_flavors',
  user: 'root',
  password: 'password',
})

app.use(express.json());
app.use(require('morgan')('dev'));

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        INSERT INTO flavors(name, is_favorite) VALUES($1, $2)
        RETURNING *;
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite])
        res.send(response.rows[0])
    } catch (err) {
        next(err)
    }
});

app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM flavors ORDER BY created_at DESC;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (err) {
        next(err)
    }
});

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM flavors
        WHERE id=$1;
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (err) {
        next(err)
    }
});

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3
        RETURNING *;
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0])
        
    } catch (err) {
        next(err)
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE FROM flavors
        WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
        
    } catch (err) {
        next(err)
    }
});

async function init() {
    await client.connect()
    console.log("connected to database")
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_favorite BOOL DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
    `
    await client.query(SQL)
    console.log("tables created")
    SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Coffee', false);
    INSERT INTO flavors(name) VALUES('Chocolate');
    INSERT INTO flavors(name, is_favorite) VALUES('Pistachio', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Raspberry', false);
    INSERT INTO flavors(name) VALUES('Mint');
    INSERT INTO flavors(name, is_favorite) VALUES('Caramel', true);    
    `;
    await client.query(SQL)
    console.log("tables seeded")
    const port = process.env.PORT || 3000
    app.listen(port), () => console.log(`listening on port ${port}`)
}

init();