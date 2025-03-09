# app.py (Flask API)
from flask import Flask, request, jsonify
import os
from model import predict_food  # Import model function

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)

# Sample Nutrition Database
food_nutrition = {
    "apple": {"calories": 52, "protein": 0.3, "carbs": 14},
    "banana": {"calories": 105, "protein": 1.3, "carbs": 27},
    "chicken": {"calories": 200, "protein": 30, "carbs": 0},
}

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = "uploads/" + file.filename
    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)

    # Predict food
    food = predict_food(file_path)

    # Get nutrition data
    nutrition = food_nutrition.get(food, {"calories": "Unknown", "protein": "Unknown", "carbs": "Unknown"})

    return jsonify({
        "food": food,
        "calories": nutrition["calories"],
        "protein": nutrition["protein"],
        "carbs": nutrition["carbs"]
    })

if __name__ == '__main__':
    app.run(debug=True)
