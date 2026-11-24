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

const limit = 3;

app.get("/dashboard", async (req, res) => {

    //---------------------------------------------first query-----------------------------------
    const customerResult = await db.query(
        "SELECT count(*) FROM customers"
    );
    const customerCount = customerResult.rows[0].count;

    //--------------------------------------second query with pagination---------------------------------------
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const query = "SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2";
    const result = await db.query(query, [limit, offset]);

    const customers = result.rows;

    const totalPages = Math.ceil(customerCount / limit);

    //---------------------------------------third query-------------------------------
    const revenueResult = await db.query(
        "SELECT sum(saleamount) FROM sales"
    );
    const revenue = revenueResult.rows[0].sum;

    //-----------------------------------------fourth query------------------------------
    const salesQuery = `
        SELECT products.name, sales.quantity, sales.saleamount
        FROM sales
        LEFT JOIN products ON sales.productid = products.id
        ORDER BY sales.id ASC
    `;
    const salesResult = await db.query(salesQuery);
    const sales = salesResult.rows;

    //----------------------------------------fifth query------------------------------------
    const orderResult = await db.query(
        "SELECT count(quantity) FROM orders"
    );
    const orderCount = orderResult.rows[0].count;

    //---------------------------sixth query--------------------------------------------
    const issuesResult = await db.query(
        "SELECT count(id) FROM alerts WHERE type = 'issues'"
    );
    const issuesCount = issuesResult.rows[0].count;

    //----------------------------------seventh query-----------------------------
    const issueResult = await db.query(
        "SELECT * FROM alerts WHERE type = 'issues'"
    );
    const issues = issueResult.rows;

    //--------------------------------eighth query----------------------------
    const notificationResult = await db.query(
        "SELECT count(id) FROM alerts WHERE type = 'notifications'"
    );
    const notificationCount = notificationResult.rows[0].count;

    //--------------------------------ninth query-------------------------------
    const notificationQuery = await db.query(
        "SELECT * FROM alerts WHERE type = 'notifications'"
    );
    const notifications = notificationQuery.rows;

    //-----------------------------------tenth query---------------------------------------
    const taskResult = await db.query(
        "SELECT * FROM alerts WHERE type = 'tasks'"
    );
    const tasks = taskResult.rows;

    //-----------------------------------final rendering with passed variables for ejs----------------------------------------------
    res.render("index.ejs", {
        customerCount: Number(customerCount).toLocaleString('en-US'),
        customers: customers,
        currentPage: page,
        totalPages: totalPages,
        revenue: Number(revenue).toLocaleString('en-US'),
        sales: sales,
        orderCount: orderCount,
        issuesCount: issuesCount,
        issues: issues,
        notificationCount: notificationCount,
        notifications: notifications,
        tasks: tasks
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
