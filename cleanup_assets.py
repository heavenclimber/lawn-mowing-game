from PIL import Image
import os

def remove_background(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        # Get the color of the top-left pixel to assume it's the background color
        bg_color = datas[0]
        
        print(f"Processing {os.path.basename(image_path)}...")
        print(f"Background color detected: {bg_color}")

        threshold = 200 # Tolerance

        for item in datas:
            # Check if pixel is close to white or the detected background color
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(image_path, "PNG")
        print(f"Saved {image_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

assets = [
    '/Users/angelastefanie/HTML5GAMES/mowing-game/assets/sprites/mower.png',
    '/Users/angelastefanie/HTML5GAMES/mowing-game/assets/obstacles/tree.png',
    '/Users/angelastefanie/HTML5GAMES/mowing-game/assets/obstacles/flower.png',
    '/Users/angelastefanie/HTML5GAMES/mowing-game/assets/obstacles/gnome.png'
]

for asset in assets:
    remove_background(asset)
