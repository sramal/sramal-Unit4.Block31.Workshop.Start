// imports here for express and pg
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const pg = require("pg");
const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://localhost/acme_hr_db"
);
const path = require("path");

const employees = [
    { name: "Rosamond Rookes", is_admin: false },
    { name: "Sandor Pucknell", is_admin: false },
    { name: "Chance Simmins", is_admin: false },
    { name: "Jada Beardow", is_admin: true },
    { name: "Clovis Spillett", is_admin: false },
    { name: "Elwira McGrath", is_admin: true },
    { name: "Letizia Fessby", is_admin: true },
    { name: "Vikky Judson", is_admin: true },
    { name: "Hedi Khalid", is_admin: true },
    { name: "Andi Rudyard", is_admin: false },
];

app.use(express.static(path.join(__dirname, "../client/dist")));

// static routes here (you only need these for deployment)
app.get("/", (req, res) => {
    res.sendFile(path(__dirname, "../client/dist/index.html"));
});

// app routes here
app.get("/api/employees", async (req, res, next) => {
    try {
        const SQL = "SELECT * FROM employees;";
        const response = await client.query(SQL);

        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// create your init function
const init = async () => {
    await client.connect();

    let SQL = "DROP TABLE IF EXISTS employees;";
    SQL += "CREATE TABLE employees(id SERIAL PRIMARY KEY,";
    SQL += "                       name VARCHAR(50),";
    SQL += "                       is_admin BOOLEAN DEFAULT FALSE); ";

    SQL += employees
        .map((employee) => {
            const tmp = `INSERT INTO employees(name, is_admin) VALUES('${employee.name}', ${employee.is_admin} );`;
            return tmp;
        })
        .join(" ");

    await client.query(SQL);
    console.log("Data seeded");

    // listen in on port
    app.listen(port, (req, res) => {
        console.log(`Server started and listening on port ${port}`);
    });
};

// init function invocation
init();
