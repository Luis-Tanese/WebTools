// Might do something with this later
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* app.listen(3000, () => {
    console.log(`Server running on port 3000`);
}); */

module.exports = app;
