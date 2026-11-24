import express from 'express'
import pg from 'pg'

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    password: "DatabasePassword4333!",
    host: "localhost",
    port: 5432,
    database: "dashboard"
});
db.connect();

app.use(express.static("public"));

app.get("/dashboard", async (req, res) => {

    //first query
    const customerResult = await db.query(
        "SELECT count(*) FROM customers"
    );
    const customerCount = customerResult.rows[0].count;

    //second query
    

    res.render("index.ejs", {
        customerCount: customerCount
    });

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
