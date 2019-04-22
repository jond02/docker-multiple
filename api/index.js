const keys = require("./keys");

//express setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

//postgres setup
const { Pool } = require("pg");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("error", () => console.log("Lost PG connection"));

pgClient.query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch(err => console.log(err));

//redis setup
const redis = require("redis");
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

//create a duplicate connection for publisher
const redisPublisher = redisClient.duplicate();

//express route handlers
app.get("/", (req, res) => {
    res.send("Hi there");
});

app.get("/values/all", async (req, res) => {
   const values = await pgClient.query("SELECT * FROM values");
   res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
});

app.post("/values", async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send("Index above 40, too high");
    }

    //index index with temp value and publish insert event
    redisClient.hset("values", index, "Nothing yet!");
    redisPublisher.publish("insert", index);

    pgClient.query("INSERT INTO values (number) VALUES($1)", [index])

    res.send({ working: true });
});

app.listen(5000, () => {
    console.log("listening on port 5000");
});
