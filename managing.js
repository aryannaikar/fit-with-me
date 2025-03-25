const URL = "https://teachablemachine.withgoogle.com/models/_PJm37bVB/"; // Replace with your model URL

let model, labelContainer, maxPredictions;

// Load the model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("? Model loaded successfully!");
}

// Call loadModel when page loads
window.onload = loadModel;

async function previewAndPredict(file) {
    const reader = new FileReader();
    reader.onload = async function (event) {
        const imageElement = document.getElementById("uploadedImage");
        imageElement.src = event.target.result;
        imageElement.style.display = "block";

        // Perform prediction
        await predictFoodFromImage(file);
    };
    reader.readAsDataURL(file);
}

// Nutrition Data
const foodData = {
    apple: { calories: 95, protein: 0.5, carbs: 25 },
    banana: { calories: 105, protein: 1.3, carbs: 27 },
    rice: { calories: 130, protein: 2, carbs: 28 },
    chapati: { calories: 70, protein: 2.7, carbs: 15 },
    chicken: { calories: 200, protein: 30, carbs: 0 },
    milk: { calories: 42, protein: 3.4, carbs: 5 },
    egg: { calories: 78, protein: 6, carbs: 1 },
    watermelon: { calories: 30, protein: 0.6, carbs: 8 },
    strawberry: { calories: 32, protein: 0.7, carbs: 7 },
    paneer: { calories: 265, protein: 18, carbs: 6 },
    daal: { calories: 120, protein: 9, carbs: 20 },
    fish: { calories: 206, protein: 22, carbs: 0 },
    soyabean: { calories: 446, protein: 36, carbs: 30 },
    curd: { calories: 98, protein: 11, carbs: 3.4 },
    kidney_beans: { calories: 127, protein: 9, carbs: 22 },
    leafy_vegetables: { calories: 25, protein: 2, carbs: 4 },
    cheese: { calories: 402, protein: 25, carbs: 1.3 }
};

// Function to update output table
function updateOutputTable(foodItem) {
    if (!foodData[foodItem]) {
        document.getElementById("predictionResult").innerHTML = `?? No nutrition data found for "${foodItem}".`;
        return;
    }

    document.getElementById("foodName").textContent = foodItem;
    document.getElementById("foodCalories").textContent = foodData[foodItem].calories;
    document.getElementById("foodProtein").textContent = foodData[foodItem].protein;
    document.getElementById("foodCarbs").textContent = foodData[foodItem].carbs;

    document.getElementById("outputTable").style.display = "table";
}

async function predictFoodFromWebcam() {
    const webcam = new tmImage.Webcam(200, 200, true); // width, height, flip
    await webcam.setup();
    await webcam.play();
    
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    
    async function captureAndPredict() {
        webcam.update();
        const prediction = await model.predict(webcam.canvas);
        
        let highestPrediction = { className: "", probability: 0 };
        prediction.forEach(pred => {
            if (pred.probability > highestPrediction.probability) {
                highestPrediction = pred;
            }
        });

        updateDietPlan(highestPrediction.className);
    }
    
    setInterval(captureAndPredict, 3000); // Predict every 3 seconds
}

// Function to predict from an uploaded image
async function predictFoodFromImage(file) {
    const reader = new FileReader();
    
    reader.onload = async function (event) {
        const img = new Image();
        img.src = event.target.result;
        await img.decode();
        
        const prediction = await model.predict(img);
        
        let highestPrediction = { className: "", probability: 0 };
        prediction.forEach(pred => {
            if (pred.probability > highestPrediction.probability) {
                highestPrediction = pred;
            }
        });

        updateDietPlan(highestPrediction.className);
    };
    
    reader.readAsDataURL(file);
}

// Function to update diet plan based on recognized food
function updateDietPlan(foodItem) {
    if (!foodData[foodItem]) {
        alert(`?? No nutrition data found for "${foodItem}".`);
        return;
    }

    const mealType = document.getElementById("meal-type").value;
    const { calories, protein, carbs } = foodData[foodItem];

    mealTotals[mealType].calories += calories;
    mealTotals[mealType].protein += protein;
    mealTotals[mealType].carbs += carbs;

    document.getElementById(`${mealType}-items`).innerHTML += `${foodItem}<br>`;
    document.getElementById(`${mealType}-calories`).textContent = mealTotals[mealType].calories.toFixed(2);
    document.getElementById(`${mealType}-protein`).textContent = mealTotals[mealType].protein.toFixed(2);
    document.getElementById(`${mealType}-carbs`).textContent = mealTotals[mealType].carbs.toFixed(2);

    alert(`? ${foodItem} added to ${mealType}!`);
}


let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;

let mealTotals = {
    breakfast: { calories: 0, protein: 0, carbs: 0 },
    lunch: { calories: 0, protein: 0, carbs: 0 },
    dinner: { calories: 0, protein: 0, carbs: 0 }
};

// Weekly summary storage to track day-wise totals
let weeklySummary = {
    1: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    2: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    3: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    4: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    5: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    6: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 },
    7: { calories: 0, protein: 0, carbs: 0, caloriesBurned: 0 }
};

// Function to toggle quantity input based on selected food item
function toggleQuantityInput() {
    const foodItemSelect = document.getElementById('food-item');
    const selectedFood = foodItemSelect.value;

    // Show quantity input for specific items
    if (["rice", "chicken", "paneer", "soybean", "peas", "kidney-beans"].includes(selectedFood)) {
        document.getElementById('quantity-container').style.display = 'block';
    } else {
        document.getElementById('quantity-container').style.display = 'none';
    }

    // Show number of items input for eggs and chapati
    if (["eggs", "chapati", "banana"].includes(selectedFood)) {
        document.getElementById('quantity-amount').style.display = 'block';
    } else {
        document.getElementById('quantity-amount').style.display = 'none';
    }
}

// Function to add selected food item to the diet plan
function addFoodItem() {
    
    const mealType = document.getElementById('meal-type').value;
    const foodItemSelect = document.getElementById('food-item');
    const foodItemText = foodItemSelect.options[foodItemSelect.selectedIndex].text;
    const caloriesPer100g = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.calories);
    const proteinPer100g = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.protein);
    const carbsPer100g = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.carbs);

    let calories, protein, carbs, quantity = 100;
    let numberItems = 1; // Default number of items

    // Check if number of items input should be used
    if (["eggs", "chapati", "banana"].includes(foodItemSelect.value)) {
        numberItems = parseFloat(document.getElementById('number-items').value);
        calories = caloriesPer100g * numberItems;
        protein = proteinPer100g * numberItems;
        carbs = carbsPer100g * numberItems;
        quantity = numberItems; // Display quantity as the number of items
    } else if (["rice", "chicken", "paneer", "soybean", "peas", "kidney-beans"].includes(foodItemSelect.value)) {
        quantity = parseFloat(document.getElementById('quantity').value);
        calories = (caloriesPer100g / 100) * quantity;
        protein = (proteinPer100g / 100) * quantity;
        carbs = (carbsPer100g / 100) * quantity;
    } else {
        // For other items, use fixed values
        calories = caloriesPer100g;
        protein = proteinPer100g;
        carbs = carbsPer100g;
        quantity = '-'; // No quantity for items other than the specified ones
    }

    // Update totals for the selected meal type
    mealTotals[mealType].calories += calories;
    mealTotals[mealType].protein += protein;
    mealTotals[mealType].carbs += carbs;

    // Update the table for the specific meal type
    document.getElementById(`${mealType}-items`).innerHTML += `${foodItemText} (${quantity === '-' ? '' : quantity + (["eggs", "chapati"].includes(foodItemSelect.value) ? '' : 'g')})<br>`;
    document.getElementById(`${mealType}-calories`).textContent = mealTotals[mealType].calories.toFixed(2);
    document.getElementById(`${mealType}-protein`).textContent = mealTotals[mealType].protein.toFixed(2);
    document.getElementById(`${mealType}-carbs`).textContent = mealTotals[mealType].carbs.toFixed(2);

    // Update overall totals
    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    document.getElementById('total-calories').textContent = totalCalories.toFixed(2);
    document.getElementById('total-protein').textContent = totalProtein.toFixed(2);
    document.getElementById('total-carbs').textContent = totalCarbs.toFixed(2);

    // Update daily totals in weekly summary
    const daySelect = document.getElementById('day-select');
    const selectedDay = daySelect.value;

    weeklySummary[selectedDay].calories += calories;
    weeklySummary[selectedDay].protein += protein;
    weeklySummary[selectedDay].carbs += carbs;

    // Update weekly summary table
    updateWeeklySummary();
}

// Function to calculate and display calories burned from steps
document.getElementById('calculate-steps').addEventListener('click', function () {
    const steps = parseInt(document.getElementById('steps').value);
    const caloriesPerStep = 0.04; // Average calories burned per step
    const caloriesBurned = steps * caloriesPerStep;

    document.getElementById('calories-burned').textContent = caloriesBurned.toFixed(2);

    // Update weekly summary with burned calories
    const daySelect = document.getElementById('day-select');
    const selectedDay = daySelect.value;

    weeklySummary[selectedDay].caloriesBurned = caloriesBurned;

    // Update weekly summary table
    updateWeeklySummary();
});

// Function to update the weekly summary table
async function updateWeeklySummary() {
    const weekSummaryBody = document.getElementById("weekly-summary-body");
    weekSummaryBody.innerHTML = ""; // Clear existing data

    for (let day = 1; day <= 7; day++) {
        try {
            const response = await fetch(`http://localhost:3000/meals?day=${day}`);
            const data = await response.json();

            let dayCalories = 0, dayProtein = 0, dayCarbs = 0;

            if (data.meals) {
                Object.keys(data.meals).forEach(mealType => {
                    data.meals[mealType].forEach(meal => {
                        dayCalories += meal.calories;
                        dayProtein += meal.protein;
                        dayCarbs += meal.carbs;
                    });
                });
            }

            // ? Create a new row in the weekly summary table
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>Day ${day}</td>
                <td>${dayCalories.toFixed(2)}</td>
                <td>0</td>  <!-- Placeholder for burned calories -->
                <td>${(dayCalories - 0).toFixed(2)}</td>
                <td>${dayProtein.toFixed(2)}</td>
                <td>${dayCarbs.toFixed(2)}</td>
            `;

            weekSummaryBody.appendChild(row);

        } catch (error) {
            console.error(`? Error fetching data for Day ${day}:`, error);
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const icons = document.querySelectorAll(".floating-icons span");

    function setRandomPosition(icon) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const randomX = Math.random() * viewportWidth;
        const randomY = Math.random() * viewportHeight;

        icon.style.left = `${randomX}px`;
        icon.style.top = `${randomY}px`;
    }

    icons.forEach(icon => {
        setRandomPosition(icon);
        icon.style.animationDelay = `${Math.random() * 5}s`;  // Staggered animations

        icon.addEventListener('animationiteration', () => {
            setRandomPosition(icon);  // Move to a new random position after each animation cycle
        });
    });
});




document.getElementById("reset-diet-plan").addEventListener("click", async () => {
    const day = parseInt(document.getElementById("day-select").value);

    if (!day || day < 1 || day > 7) {
        alert("? Please select a valid day before resetting.");
        return;
    }

    const confirmReset = confirm(`?? Are you sure you want to reset Day ${day}'s diet plan?`);
    if (!confirmReset) return;

    try {
        // ? API call to delete meals for the selected day
        const response = await fetch(`http://localhost:3000/resetMeals?day=${day}`, {
            method: "DELETE"
        });

        const result = await response.text();
        alert(result);

        // ? Clear the table after deleting meals
        document.getElementById("breakfast-items").innerHTML = "";
        document.getElementById("lunch-items").innerHTML = "";
        document.getElementById("dinner-items").innerHTML = "";

        document.getElementById("breakfast-calories").textContent = "0";
        document.getElementById("lunch-calories").textContent = "0";
        document.getElementById("dinner-calories").textContent = "0";

        document.getElementById("breakfast-protein").textContent = "0";
        document.getElementById("lunch-protein").textContent = "0";
        document.getElementById("dinner-protein").textContent = "0";

        document.getElementById("breakfast-carbs").textContent = "0";
        document.getElementById("lunch-carbs").textContent = "0";
        document.getElementById("dinner-carbs").textContent = "0";

        // ? Reset total values
        document.getElementById("total-calories").textContent = "0";
        document.getElementById("total-protein").textContent = "0";
        document.getElementById("total-carbs").textContent = "0";

        // ? Refresh weekly summary after reset
        updateWeeklySummary();

    } catch (error) {
        console.error("? Error resetting diet plan:", error);
    }
});












async function fetchMeals(day) {
    try {
        const response = await fetch(`http://localhost:3000/meals?day=${day}`);
        const data = await response.json();
        console.log("Meals for Day", day, ":", data);
        return data;
    } catch (error) {
        console.error("? Error fetching meals:", error);
    }
}



async function addFoodItem() {
    const day = document.getElementById('day-select').value;
    const mealType = document.getElementById('meal-type').value;
    const foodItemSelect = document.getElementById('food-item');
    const foodName = foodItemSelect.options[foodItemSelect.selectedIndex].text;
    const calories = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.calories);
    const protein = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.protein);
    const carbs = parseFloat(foodItemSelect.options[foodItemSelect.selectedIndex].dataset.carbs);


    const token = localStorage.getItem("token");
    if (!token) {
        alert("? Please log in first!");
        return;
    }


    const mealData = { day: parseInt(day), mealType, foodName, calories, protein, carbs };

    try {
        const response = await fetch("http://localhost:3000/addMeal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mealData)
        });

        const result = await response.json();
        alert(result.message);

        // ? Fetch & display updated meals
        fetchAndDisplayMeals();
        updateWeeklySummary();  // Refresh weekly summary

    } catch (error) {
        console.error("? Error adding meal:", error);
    }

}




async function fetchAndDisplayMeals() {
    const day = document.getElementById("day-select").value;

    try {
        const response = await fetch(`http://localhost:3000/meals?day=${day}`);
        const data = await response.json();

        if (!data.meals) {
            console.warn("?? No meals found for the selected day.");
            return;
        }

        // ? Clear previous meal data
        document.getElementById("breakfast-items").innerHTML = "";
        document.getElementById("lunch-items").innerHTML = "";
        document.getElementById("dinner-items").innerHTML = "";

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;

        // ? Populate the table with meal data and calculate totals
        Object.keys(data.meals).forEach(mealType => {
            data.meals[mealType].forEach(meal => {
                document.getElementById(`${mealType}-items`).innerHTML += `${meal.foodName}<br>`;
                totalCalories += meal.calories;
                totalProtein += meal.protein;
                totalCarbs += meal.carbs;
            });
        });

        // ? Update totals in the table
        document.getElementById("total-calories").textContent = totalCalories.toFixed(2);
        document.getElementById("total-protein").textContent = totalProtein.toFixed(2);
        document.getElementById("total-carbs").textContent = totalCarbs.toFixed(2);

        // ? Update weekly summary data
        updateWeeklySummary();

    } catch (error) {
        console.error("? Error fetching meals:", error);
    }
}





document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayMeals(); // Load meals when the page loads
});
