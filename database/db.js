const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017"; // Use local MongoDB or an environment variable for Atlas

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        return client.db("diet_planner"); // Change "diet_planner" to your database name
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    }
}

module.exports = { connectDB };
