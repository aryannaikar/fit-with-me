document.getElementById("dietFormFemale").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const height = parseFloat(document.getElementById("heightFemale").value);
    const age = parseInt(document.getElementById("ageFemale").value);
    const weight = parseFloat(document.getElementById("weightFemale").value);
    const pulseRate = parseInt(document.getElementById("pulseRate").value);
    const goal = document.querySelector('input[name="goal"]:checked')?.value || "maintain"; 
    const bodyType = document.querySelector('input[name="body-type"]:checked')?.value || "mesomorph"; 
    const dietType = document.querySelector('input[name="diet-type"]:checked')?.value || "none";

    if (isNaN(height) || isNaN(age) || isNaN(weight) || isNaN(pulseRate)) {
        alert("Please enter valid values for height, weight, age, and pulse rate.");
        return;
    }

    const bmi = calculateBMIFemale(weight, height);
    const bmr = calculateBMRFemale(weight, height, age);
    const caloricNeeds = adjustCaloriesForGoal(bmr, goal);
    const bgi = calculateBGI(bodyType);
    const dietPlan = generateDietPlan(bgi, caloricNeeds, goal, dietType, pulseRate);
    
    displayResults(dietPlan, caloricNeeds, bgi, bmi, bmr, weight, goal, dietType, pulseRate);
});

function calculateBMIFemale(weight, height) {
    const heightInMeters = height * 0.0254;
    const weightInKg = weight * 0.453592;
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
}

function calculateBMRFemale(weight, height, age) {
    const weightInKg = weight * 0.453592;
    const heightInCm = height * 2.54;
    return (655 + (9.6 * weightInKg) + (1.8 * heightInCm) - (4.7 * age)).toFixed(2);
}

function adjustCaloriesForGoal(bmr, selectedOption) {
    if (selectedOption === "weight loss") return bmr - 500;
    if (selectedOption === "muscle gain") return bmr + 500;
    return bmr;
}

function calculateBGI(selectedBodyType) {
    return selectedBodyType === "ectomorph" ? 50 : selectedBodyType === "mesomorph" ? 60 : 70;
}

function generateDietPlan(bgi, caloricIntake, goal, dietType, pulseRate) {
    const foodItems = {
        chicken: { calories: 165, protein: 31, carbs: 0, bgi: 0, vegetarian: false, suitableFor: "tachycardia" },
        salad: { calories: 33, protein: 2, carbs: 7, bgi: 10, vegetarian: true, suitableFor: "tachycardia" },
        apple: { calories: 95, protein: 0.5, carbs: 25, bgi: 38, vegetarian: true, suitableFor: "bradycardia" },
        rice: { calories: 130, protein: 2.7, carbs: 28, bgi: 73, vegetarian: true, suitableFor: "all" },
        fish: { calories: 206, protein: 22, carbs: 0, bgi: 0, vegetarian: false, suitableFor: "tachycardia" },
        chapati: { calories: 120, protein: 3, carbs: 24, bgi: 50, vegetarian: true, suitableFor: "all" },
        walnuts: { calories: 185, protein: 4, carbs: 4, bgi: 10, vegetarian: true, suitableFor: "tachycardia" },
        lentils: { calories: 230, protein: 18, carbs: 40, bgi: 30, vegetarian: true, suitableFor: "bradycardia" },
        eggs: { calories: 155, protein: 13, carbs: 1, bgi: 0, vegetarian: false, suitableFor: "all" },
        oatmeal: { calories: 150, protein: 5, carbs: 27, bgi: 55, vegetarian: true, suitableFor: "bradycardia" },
        kidneyBeans: { calories: 225, protein: 15, carbs: 40, bgi: 60, vegetarian: true, suitableFor: "bradycardia" },
        paneer: { calories: 296, protein: 25, carbs: 4, bgi: 15, vegetarian: true, suitableFor: "bradycardia" },
        tofu: { calories: 80, protein: 8, carbs: 3, bgi: 15, vegetarian: true, suitableFor: "bradycardia" },
        // lentils: { calories: 230, protein: 18, carbs: 40, bgi: 30, vegetarian: true, suitableFor: "bradycardia" },
        // quinoa: { calories: 222, protein: 8, carbs: 39, bgi: 53, vegetarian: true, suitableFor: "all" },
        chickpeas: { calories: 269, protein: 15, carbs: 45, bgi: 10, vegetarian: true, suitableFor: "bradycardia" }
    };

    let availableFoodItems = (dietType === "vegetarian")
        ? Object.fromEntries(Object.entries(foodItems).filter(([_, details]) => details.vegetarian))
        : foodItems;

    availableFoodItems = filterFoodByPulseRate(pulseRate, availableFoodItems);

    return ["breakfast", "lunch", "dinner"].map(meal => 
        chooseFoodsForMeal(caloricIntake / 3, bgi, availableFoodItems)
    );
}

function chooseFoodsForMeal(calorieTarget, targetBGI, foodItems) {
    let mealPlan = [];
    let remainingCalories = calorieTarget;
    let totalBGI = 0;
    
    const shuffledFoodNames = Object.keys(foodItems).sort(() => Math.random() - 0.5);

    for (const foodName of shuffledFoodNames) {
        const foodInfo = foodItems[foodName];

        if (foodInfo.calories <= remainingCalories && totalBGI + foodInfo.bgi <= targetBGI) {
            mealPlan.push({ food: foodName, quantity: `100g`, calories: foodInfo.calories, bgi: foodInfo.bgi });
            remainingCalories -= foodInfo.calories;
            totalBGI += foodInfo.bgi;
        }

        if (remainingCalories <= 0 || totalBGI >= targetBGI) break;
    }

    return mealPlan;
}

function filterFoodByPulseRate(pulseRate, foodItems) {
    return Object.fromEntries(Object.entries(foodItems).filter(([_, details]) =>
        details.suitableFor === (pulseRate > 100 ? "tachycardia" : pulseRate < 60 ? "bradycardia" : "all") || details.suitableFor === "all"));
}

function displayResults(dietPlan, caloricNeeds, bgi, bmi, bmr, weight, goal, dietType, pulseRate) {
    const resultsDiv = document.getElementById("resultsFemale");
    resultsDiv.innerHTML = `<h2>Your Results:</h2>
        <p><strong>BMI:</strong> ${bmi}</p>
        <p><strong>BMR:</strong> ${bmr} kcal/day</p>
        <p><strong>Caloric Needs:</strong> ${caloricNeeds} kcal/day</p>
        <p><strong>BGI:</strong> ${bgi}</p>
        <p><strong>Goal:</strong> ${goal}</p>
        <p><strong>Diet Type:</strong> ${dietType}</p>
        <p><strong>Pulse Rate:</strong> ${pulseRate} BPM</p>`;

    let pulseMessage = "";
    if (pulseRate > 100) {
        pulseMessage = `<h3 style="color: red;">High Pulse Rate Detected (Tachycardia). Consider:</h3>
        <ul>
            <li>Increase hydration: Water, herbal teas</li>
            <li>Reduce sodium: Avoid processed foods</li>
            <li>Eat potassium-rich foods: Bananas, oranges, spinach</li>
            <li>Limit caffeine & sugar: Reduce coffee, energy drinks</li>
        </ul>`;
    } else if (pulseRate < 60) {
        pulseMessage = `<h3 style="color: blue;">Low Pulse Rate Detected (Bradycardia). Consider:</h3>
        <ul>
            <li>Increase iron intake: Lean meats, spinach</li>
            <li>Consume iodine-rich foods: Seaweed, dairy</li>
        </ul>`;
    } else {
        pulseMessage = `<h3 style="color: green;">Normal Pulse Rate Detected.</h3>`;
    }

    resultsDiv.innerHTML += pulseMessage;

    dietPlan.forEach((meal, index) => {
        resultsDiv.innerHTML += `<h3>${["Breakfast", "Lunch", "Dinner"][index]}</h3><ul>`;
        meal.forEach(food => {
            resultsDiv.innerHTML += `<li>${food.quantity} of ${food.food} - ${food.calories} calories, BGI: ${food.bgi}</li>`;
        });
        resultsDiv.innerHTML += `</ul>`;
    });
}
