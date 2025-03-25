const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB URI

let db;

// ✅ Connect to MongoDB directly in `server.js`
async function connectDB() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        db = client.db("dietPlannerDB"); // Replace <dbname> with your database name
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    }
}

connectDB(); // Call the function to connect

// 📌 **API: Get All Saved Meals**
app.get("/meals", async (req, res) => {
    const day = parseInt(req.query.day);

    if (!day || day < 1 || day > 7) {
        return res.status(400).send("❌ Invalid day selection");
    }

    try {
        const mealsForDay = await db.collection("meals").findOne({ day });

        if (!mealsForDay) {
            return res.json({ day, meals: { breakfast: [], lunch: [], dinner: [] } });
        }

        res.json(mealsForDay);
    } catch (err) {
        res.status(500).send("❌ Failed to fetch meals");
    }
});

// ✅ **API: Store Meal in MongoDB**
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




// ✅ **API: Delete Meals for a Day**
app.delete("/resetMeals", async (req, res) => {
    const day = parseInt(req.query.day);

    if (!day || day < 1 || day > 7) {
        return res.status(400).send("❌ Invalid day selection");
    }

    try {
        await db.collection("meals").deleteMany({ day });
        res.send(`✅ All meals deleted for Day ${day}`);
    } catch (err) {
        res.status(500).send("❌ Failed to delete meals");
    }
});



// 🚀 **Start Server**
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
