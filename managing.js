const URL = "https://teachablemachine.withgoogle.com/models/_PJm37bVB/"; // Replace with your model URL

let model, labelContainer, maxPredictions;

// Load the model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("✅ Model loaded successfully!");
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
        document.getElementById("predictionResult").innerHTML = `⚠️ No nutrition data found for "${foodItem}".`;
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
        alert(`⚠️ No nutrition data found for "${foodItem}".`);
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

    alert(`✅ ${foodItem} added to ${mealType}!`);
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
function updateWeeklySummary() {
    const weekSummaryBody = document.getElementById('weekly-summary-body');
    weekSummaryBody.innerHTML = ''; // Clear previous entries

    // Loop through each day and add to the summary table
    for (let day = 1; day <= 7; day++) {
        const row = document.createElement('tr');

        const dayCell = document.createElement('td');
        dayCell.textContent = `Day ${day}`;
        row.appendChild(dayCell);

        const caloriesConsumed = weeklySummary[day].calories;
        const caloriesBurned = weeklySummary[day].caloriesBurned;
        const netCalories = caloriesConsumed - caloriesBurned;
        const protein = weeklySummary[day].protein;
        const carbs = weeklySummary[day].carbs;

        row.innerHTML += `<td>${caloriesConsumed.toFixed(2)}</td>`;
        row.innerHTML += `<td>${caloriesBurned.toFixed(2)}</td>`;
        row.innerHTML += `<td>${netCalories.toFixed(2)}</td>`;
        row.innerHTML += `<td>${protein.toFixed(2)}</td>`;
        row.innerHTML += `<td>${carbs.toFixed(2)}</td>`;

        weekSummaryBody.appendChild(row);
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

document.getElementById("reset-diet-plan").addEventListener("click", () => {
    const mealTypes = ["breakfast", "lunch", "dinner"];

    mealTypes.forEach(meal => {
        document.getElementById(`${meal}-items`).innerHTML = "";           // Clear food items
        document.getElementById(`${meal}-calories`).textContent = "0";     // Reset calories
        document.getElementById(`${meal}-protein`).textContent = "0";      // Reset protein
        document.getElementById(`${meal}-carbs`).textContent = "0";        // Reset carbs
    });

    // Reset total values
    document.getElementById("total-calories").textContent = "0";
    document.getElementById("total-protein").textContent = "0";
    document.getElementById("total-carbs").textContent = "0";

    alert("✅ Diet plan has been reset!");
});

