import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # FATAL
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import sys
sys.stdout.reconfigure(encoding='utf-8')
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


import tensorflow as tf
import re

# Load the model
model = load_model('my_model.keras')

# Get the image path from the command line arguments
img_path = sys.argv[1]

# Load and preprocess the image
# Load the image and decode it into a tensor
img = tf.io.read_file(img_path)
img = tf.image.decode_image(img, channels=3)

# Resize the image to the model's input size
img = tf.image.resize(img, [224, 224])  # Adjust [224, 224] based on your model's input size

# Normalize the image to [0, 1] range
img = img / 255.0

# Add the batch dimension
img_array = tf.expand_dims(img, axis=0)

# Make a prediction
predictions = model.predict(img_array,verbose=0)
predicted_class = np.argmax(predictions, axis=1)

# Print the result to the console

output = str(predicted_class[0])
ansi_escape = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
clean_output = ansi_escape.sub('', output)

# Print the clean result to the console
print(clean_output)
