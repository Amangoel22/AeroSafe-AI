import cv2
import glob

images = glob.glob("runway_images/*.jpg") + glob.glob("runway_images/*.png")
images.sort()

print(f"Found {len(images)} images")

frame = cv2.imread(images[0])
h, w, _ = frame.shape

# AVI format use karo - Windows pe better kaam karta hai
out = cv2.VideoWriter("runway_test.avi", 
                      cv2.VideoWriter_fourcc(*'XVID'), 
                      2, (w, h))

for img_path in images:
    frame = cv2.imread(img_path)
    if frame is not None:
        for _ in range(6):
            out.write(frame)

out.release()
print("✅ Video ready: runway_test.avi")