import { fileURLToPath } from "url";
import path, { dirname } from "path";
import express from "express";
import dotenv from "dotenv";
import bot from "./Bot/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname,"..","dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"..","dist", "index.html"));
});

const port = process.env.PORT || 6000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});

// Launch the bot
bot
    .launch()
    .then(() => {
        console.log("Bot launched successfully");
    })
    .catch((err) => {
        console.error("Bot launch failed:", err);
    });
