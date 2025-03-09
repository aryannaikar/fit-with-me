from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Load Trained Model
model = load_model("model/food_model.h5")

def predict_food(img_path):
    """Processes image and predicts food class."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    preds = model.predict(img_array)
    predicted_label = np.argmax(preds)  # Get class index
    return predicted_label
