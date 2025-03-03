// Might do something with this later
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();

const allowedOrigins = [
    "https://tools.tanese.com",
    "https://web-tools-mu.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                const msg =
                    "My silly CORS policy doesn't allow access from this site (¬_¬ ).";
                return callback(new Error(msg), false);
            }

            return callback(null, true);
        },
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    })
);

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
