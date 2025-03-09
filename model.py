# model.py (Handles food recognition)
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
import numpy as np

# Load Pre-trained Model (Only once)
model = MobileNetV2(weights='imagenet')

def predict_food(img_path):
    """Processes image and returns predicted food label."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize

    preds = model.predict(img_array)
    predicted_label = "apple"  # Replace with actual label from model
    return predicted_label
