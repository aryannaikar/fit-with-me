const CLIENT_ID = '862421413145-j1g53d2d89o75c2ng9o9u9joipm4ls0v.apps.googleusercontent.com'; // Replace with your actual Google Client ID
const CLIENT_SECRET = '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'; // Replace with your actual Client Secret
const REDIRECT_URI = 'http://localhost:5500/managing.html'; // Adjust as needed


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


// Function to initiate Google Sign-in
function onGoogleSignIn() {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=https://www.googleapis.com/auth/fitness.activity.read` +
        `&access_type=offline`;

    window.location.href = authUrl; // Redirect user to Google login
}

// Function to exchange authorization code for an access token
async function getAccessToken(code) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        })
    });
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    fetchStepsFromGoogleFit();
}

// Function to extract authorization code from URL
async function handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
        const code = params.get('code');
        const response = await fetch('http://localhost:3000/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        fetchStepsFromGoogleFit();
    }
}


// Function to fetch step count from Google Fit
async function fetchStepsFromGoogleFit() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "aggregateBy": [{ "dataTypeName": "com.google.step_count.delta" }],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": Date.now() - 86400000,
            "endTimeMillis": Date.now()
        })
    });

    const data = await response.json();
    const steps = data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    const caloriesBurned = steps * 0.04; // Approximate calories per step
    document.getElementById('steps').value = steps;
    document.getElementById('calories-burned').textContent = caloriesBurned.toFixed(2);
    saveStepData(steps, caloriesBurned);
}

// Function to save step data in localStorage
function saveStepData(steps, caloriesBurned) {
    localStorage.setItem('steps', steps);
    localStorage.setItem('caloriesBurned', caloriesBurned);
}

// Load stored data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('steps').value = localStorage.getItem('steps') || 0;
    document.getElementById('calories-burned').textContent = localStorage.getItem('caloriesBurned') || 0;
    handleAuthCallback();
});
