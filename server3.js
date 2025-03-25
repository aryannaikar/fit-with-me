const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const secretKey = "your_secret_key"; // Change this to a secure key

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017/";
let db;

// ✅ Connect to MongoDB
async function connectDB() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        db = client.db("dietPlannerDB");
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    }
}

connectDB();

// 📌 **Register User**
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "❌ Username and password required" });
    }

    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: "❌ Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({ username, password: hashedPassword });

    res.status(201).json({ message: "✅ Registration successful!" });
});

// 📌 **Login User**
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    
    const user = await db.collection("users").findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: "❌ Invalid credentials" });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    res.json({ success: true, token });
});

// 📌 **Save User Meals**
app.post("/addMeal", async (req, res) => {
    const { day, mealType, foodName, calories, protein, carbs } = req.body;

    if (!day || !mealType || !foodName || calories == null || protein == null || carbs == null) {
        return res.status(400).json({ error: "❌ Missing required meal data" });
    }

    try {
        const existingDay = await db.collection("meals").findOne({ day });

        if (existingDay) {
            // ✅ Fix: Ensure meals are stored in the correct format
            await db.collection("meals").updateOne(
                { day },
                { 
                    $push: { 
                        [`meals.${mealType}`]: { 
                            foodName, 
                            calories: Number(calories), 
                            protein: Number(protein), 
                            carbs: Number(carbs) 
                        } 
                    }
                }
            );
        } else {
            // ✅ Fix: Create a new entry if the day doesn't exist
            await db.collection("meals").insertOne({
                day,
                meals: {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    [mealType]: [{ foodName, calories: Number(calories), protein: Number(protein), carbs: Number(carbs) }]
                }
            });
        }

        res.status(201).json({ message: `✅ Meal stored successfully for Day ${day}` });

    } catch (err) {
        console.error("❌ Error storing meal:", err);
        res.status(500).json({ error: "❌ Failed to store meal" });
    }
});


// 📌 **Get User Meals**
app.get("/meals", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "❌ Unauthorized" });

    try {
        const decoded = jwt.verify(token, secretKey);
        const day = parseInt(req.query.day);

        const mealsForDay = await db.collection("meals").findOne({ username: decoded.username, day });

        res.json(mealsForDay || { day, meals: { breakfast: [], lunch: [], dinner: [] } });

    } catch (err) {
        res.status(401).json({ message: "❌ Invalid token" });
    }
});

// 📌 **Reset Meals for a User**
app.delete("/resetMeals", async (req, res) => {
    const day = parseInt(req.query.day);

    if (!day || day < 1 || day > 7) {
        return res.status(400).send("❌ Invalid day selection");
    }

    try {
        await db.collection("meals").deleteOne({ day }); // ✅ Delete only meals for the selected day
        res.send(`✅ All meals deleted for Day ${day}`);
    } catch (err) {
        res.status(500).send("❌ Failed to delete meals");
    }
});
