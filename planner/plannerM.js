document.getElementById("dietFormMale").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const height = parseFloat(document.getElementById("heightMale").value);
    const age = parseInt(document.getElementById("ageMale").value);
    const weight = parseFloat(document.getElementById("weightMale").value);
    const goal = document.querySelector('input[name="goal"]:checked').value; // Get selected goal
    const bodyType = document.querySelector('input[name="body-type"]:checked').value; // Get selected body type
    const dietType = document.querySelector('input[name="diet-type"]:checked') ? document.querySelector('input[name="diet-type"]:checked').value : "none"; // Get selected diet type (vegetarian)

    const bmi = calculateBMIMale(weight, height);
    const bmr = calculateBMRMale(weight, height, age);
    const caloricNeeds = adjustCaloriesForGoal(bmr, goal);
    const bgi = calculateBGI(bodyType);

    const dietPlan = generateDietPlan(bgi, caloricNeeds, goal, dietType);
    
    displayResults(dietPlan, caloricNeeds, bgi, bmi, bmr, weight, goal, dietType); // Pass dietType to displayResults
});

document.querySelectorAll('input[name="goal"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const selectedOption = document.querySelector('input[name="goal"]:checked').value;
        console.log('Selected option:', selectedOption);
    });
});

document.querySelectorAll('input[name="body-type"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const selectedBodyType = document.querySelector('input[name="body-type"]:checked').value;
        console.log('Selected BodyType:', selectedBodyType);
    });
});

function calculateBMIMale(weight, height) {
    const heightInMeters = height * 0.0254; // Convert height from inches to meters
    const weightInKg = weight * 0.453592; // Convert weight from lbs to kg
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
}

function calculateBMRMale(weight, height, age) {
    return 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
}

function adjustCaloriesForGoal(bmr, selectedOption) {
    if (selectedOption === "weight loss") {
        return bmr - 500;
    } else if (selectedOption === "muscle gain") {
        return bmr + 500;
    } else {
        return bmr;
    }
}

function calculateBGI(selectedBodyType) {
    if (selectedBodyType === "ectomorph") {
        return 60;
    } else if (selectedBodyType === "mesomorph") {
        return 70;
    } else {
        return 80;
    }
}

function calculateProteinIntake(weight, goal) {
    const weightInKg = weight * 0.453592; // Convert weight from pounds to kg
    let proteinIntake;

    switch (goal) {
        case "weight loss":
            proteinIntake = weightInKg * 1.4; // Average of 1.2 to 1.6
            break;
        case "muscle gain":
            proteinIntake = weightInKg * 1.9; // Average of 1.6 to 2.2
            break;
        case "maintain":
        default:
            proteinIntake = weightInKg * 1.1; // Average of 1.0 to 1.2
            break;
        case "vegetarian":
            proteinIntake = weightInKg * 1.5; // Adjusted for vegetarian
            break;
    }

    return proteinIntake.toFixed(2); // Return protein intake rounded to two decimal places
}

function generateDietPlan(bgi, caloricIntake, goal, dietType) {
    const foodItems = {
        eggs: { calories: 155, protein: 13, carbs: 1, bgi: 0, vegetarian: false },
        oatmeal: { calories: 150, protein: 5, carbs: 27, bgi: 55, vegetarian: true },
        chicken: { calories: 165, protein: 31, carbs: 0, bgi: 0, vegetarian: false },
        salad: { calories: 33, protein: 2, carbs: 7, bgi: 10, vegetarian: true },
        apple: { calories: 95, protein: 0.5, carbs: 25, bgi: 38, vegetarian: true },
        rice: { calories: 130, protein: 2.7, carbs: 28, bgi: 73, vegetarian: true },
        fish: { calories: 206, protein: 22, carbs: 0, bgi: 0, vegetarian: false }, // Example: salmon
        chapati: { calories: 120, protein: 3, carbs: 24, bgi: 50, vegetarian: true }, // Whole wheat
        kidneyBeans: { calories: 225, protein: 15, carbs: 40, bgi: 60, vegetarian: true }, // Cooked
        paneer: { calories: 296, protein: 25, carbs: 4, bgi: 15, vegetarian: true }, // Indian cottage cheese
        tofu: { calories: 80, protein: 8, carbs: 3, bgi: 15, vegetarian: true }, // Tofu
        lentils: { calories: 230, protein: 18, carbs: 40, bgi: 30, vegetarian: true }, // Cooked lentils
        quinoa: { calories: 222, protein: 8, carbs: 39, bgi: 53, vegetarian: true }, // Cooked quinoa
        chickpeas: { calories: 269, protein: 15, carbs: 45, bgi: 10, vegetarian: true } // Cooked chickpeas
    };

    // Filter food items based on the 'vegetarian' goal or diet type
    const availableFoodItems = (dietType === "vegetarian") ?
        Object.fromEntries(
            Object.entries(foodItems).filter(([food, details]) => details.vegetarian)
        ) : foodItems;

    const meals = ["breakfast", "lunch", "dinner"];
    const totalCalories = caloricIntake;
    const mealCalories = [totalCalories * 0.3, totalCalories * 0.4, totalCalories * 0.3];

    return meals.map((meal, index) => chooseFoodsForMeal(mealCalories[index], bgi, availableFoodItems));
}

function chooseFoodsForMeal(calorieTarget, targetBGI, foodItems) {
    let mealPlan = [];
    let remainingCalories = calorieTarget;
    let totalBGI = 0;
    const foodNames = Object.keys(foodItems);

    const shuffledFoodNames = foodNames.sort(() => 0.5 - Math.random());

    for (const foodName of shuffledFoodNames) {
        const foodInfo = foodItems[foodName];

        if (foodInfo.calories <= remainingCalories && totalBGI + foodInfo.bgi <= targetBGI) {
            const portionSize = Math.min(remainingCalories / foodInfo.calories, 1);
            mealPlan.push({
                food: foodName,
                quantity: `${(portionSize * 100).toFixed(0)}g`,
                calories: (foodInfo.calories * portionSize).toFixed(2),
                bgi: (foodInfo.bgi * portionSize).toFixed(2),
            });
            remainingCalories -= foodInfo.calories * portionSize;
            totalBGI += foodInfo.bgi * portionSize;
        }

        if (remainingCalories <= 0 || totalBGI >= targetBGI) {
            break;
        }
    }

    return mealPlan;
}

function displayResults(dietPlan, caloricNeeds, bgi, bmi, bmr, weight, goal, dietType) {
    const resultsDiv = document.getElementById("resultsMale");
    
    let bmiCategory = "";
    if (bmi < 18.5) {
        bmiCategory = "Underweight";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        bmiCategory = "Normal weight";
    } else if (bmi >= 25 && bmi <= 29.9) {
        bmiCategory = "Overweight";
    } else {
        bmiCategory = "Obese";
    }

    const proteinIntake = calculateProteinIntake(weight, goal); // Calculate protein intake

    resultsDiv.innerHTML = `<h2>Your BMR: ${bmr.toFixed(2)} calories/day</h2>
                            <h2>Your BMI: ${bmi} (${bmiCategory})</h2>
                            <h2>Your Daily Caloric Needs: ${caloricNeeds.toFixed(2)} calories</h2>
                            <h2>Your Target BGI: ${bgi}</h2>
                            <h2>Your Daily Protein Intake: ${proteinIntake} grams</h2>`; // Display protein intake

    ["breakfast", "lunch", "dinner"].forEach((meal, index) => {
        const mealPlan = dietPlan[index];
        let mealHTML = `<h3>${meal.charAt(0).toUpperCase() + meal.slice(1)}:</h3><ul>`;
        
        mealPlan.forEach(food => {
            mealHTML += `<li>${food.quantity} of ${food.food} - ${food.calories} calories, BGI: ${food.bgi}</li>`;
        });

        mealHTML += "</ul>";
        resultsDiv.innerHTML += mealHTML;
    });
}
