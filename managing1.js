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


// function fetchStepsFromPhone() {
//     fetch('/api/get_steps')
//         .then(response => response.json())
//         .then(data => {
//             const steps = data.steps || 0;
//             document.getElementById('steps').value = steps;
//             const caloriesBurned = steps * 0.04;
//             document.getElementById('calories-burned').textContent = caloriesBurned.toFixed(2);
//         })
//         .catch(() => alert('❌ Failed to fetch steps.'));
// }

//const CLIENT_ID = "862421413145-j1g53d2d89o75c2ng9o9u9joipm4ls0v.apps.googleusercontent.com";

 //Local testing
// const REDIRECT_URI = "http://localhost:8000/auth/callback";  

// // For deployment (Vercel)
// const REDIRECT_URI = "https://fit-with-me.vercel.app/auth/callback";

// function onGoogleSignIn() {
//      const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
//      `client_id=${CLIENT_ID}` +
//      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +  
//      `&response_type=token` +
//      `&scope=https://www.googleapis.com/auth/fitness.activity.read`;

//      window.location.href = authUrl; // Redirect user to Google login
// }

function onGoogleSignIn() {
    const CLIENT_ID = '862421413145-j1g53d2d89o75c2ng9o9u9joipm4ls0v.apps.googleusercontent.com'; // Replace with your actual client ID
   // const REDIRECT_URI = 'http://localhost:5500/auth/callback'; // Replace with your actual redirect URI
   const REDIRECT_URI = 'http://localhost:5500/mini%20project/managing.html';
    if (!CLIENT_ID || !REDIRECT_URI) {
        console.error("Client ID or Redirect URI is missing. Please configure them.");
        return; // Exit the function if configuration is missing
    }

    const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=https://www.googleapis.com/auth/fitness.activity.read`;
        '&access_type=offline';

    window.location.href = authUrl; // Redirect user to Google login
}


