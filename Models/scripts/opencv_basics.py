import cv2
import os

# Define the path to an image from the dataset
# Adjust this path based on the exact structure inside your data/ folder
image_path = os.path.join('..', 'data', 'normal', '1.jpg')

if not os.path.exists(image_path):
    print(f"Image not found at {image_path}. Please update the path to point to a valid image in your dataset.")
else:
    # 1. Image Read
    img = cv2.imread(image_path)
    
    if img is None:
        print("Error: Could not load image.")
    else:
        # 2. Resize
        # Resizing the image to a standard 640x480 resolution
        resized_img = cv2.resize(img, (640, 480))
        
        # 3. Grayscale
        # Convert the resized image to grayscale
        gray = cv2.cvtColor(resized_img, cv2.COLOR_BGR2GRAY)
        
        # 4. Edge Detection
        # Apply Canny edge detection
        edges = cv2.Canny(gray, threshold1=100, threshold2=200)

        # Show the images
        cv2.imshow('Original Resized', resized_img)
        cv2.imshow('Grayscale', gray)
        cv2.imshow('Edges', edges)
        
        # Wait until a key is pressed, then close all windows
        print("Press any key on the image windows to close them.")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
