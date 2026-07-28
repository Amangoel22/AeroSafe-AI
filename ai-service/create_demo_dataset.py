# ============================================================
# 🚀 RUN THIS IN GOOGLE COLAB
# Creates a balanced ~200-image demo dataset for AAI Runway
# ============================================================

from roboflow import Roboflow
import os, shutil, random, yaml

# ── DOWNLOAD ALL DATASETS ──────────────────────────────────
rf = Roboflow(api_key="WASiObfwSdzotctxlYxb")

dataset1 = rf.workspace("priyanka-wadhwani").project("runway-crack-detection-0xwrs-fjvlu").version(1).download("yolov8")
dataset2 = rf.workspace("priyanka-wadhwani").project("fod-i2kfx-1sdqh").version(2).download("yolov8")
dataset3 = rf.workspace("priyanka-wadhwani").project("airport-detection-gehvq-1ctpq").version(1).download("yolov8")
dataset4 = rf.workspace("priyanka-wadhwani").project("yolov8_bird_detection-e61nk-9viaj").version(1).download("yolov8")
dataset5 = rf.workspace("priyanka-wadhwani").project("animals-dataset-mi6gl-hquf0").version(1).download("yolov8")

print("✅ All datasets downloaded!\n")


# ── HELPER: Read class names from data.yaml ────────────────
def get_class_names(dataset_path):
    """Read class names from dataset's data.yaml"""
    yaml_path = os.path.join(dataset_path, "data.yaml")
    if os.path.exists(yaml_path):
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
        return data.get("names", [])
    return []


# ── HELPER: Get class IDs present in an image's label file ─
def get_label_classes(label_path):
    """Read YOLO label file and return set of class IDs"""
    classes = set()
    if os.path.exists(label_path):
        with open(label_path, "r") as f:
            for line in f:
                parts = line.strip().split()
                if parts:
                    classes.add(int(parts[0]))
    return classes


# ── HELPER: Collect images from a dataset split ────────────
def get_images_from_splits(dataset_path):
    """Get all images from train + valid splits"""
    all_images = []
    for split in ["train", "valid", "test"]:
        img_dir = os.path.join(dataset_path, split, "images")
        lbl_dir = os.path.join(dataset_path, split, "labels")
        if os.path.exists(img_dir):
            for img in os.listdir(img_dir):
                if img.lower().endswith((".jpg", ".jpeg", ".png")):
                    img_path = os.path.join(img_dir, img)
                    # Find matching label file
                    lbl_name = os.path.splitext(img)[0] + ".txt"
                    lbl_path = os.path.join(lbl_dir, lbl_name)
                    all_images.append((img_path, lbl_path))
    return all_images


# ── SMART FILTERING FOR AIRPORT DATASET ────────────────────
def filter_airport_images(dataset_path, max_planes=5, max_non_planes=35):
    """
    Split airport images into plane vs non-plane categories
    using YOLO label files. Returns (plane_images, non_plane_images)
    """
    class_names = get_class_names(dataset_path)
    print(f"   Airport classes: {class_names}")

    # Find which class IDs are "plane"
    plane_class_ids = set()
    for idx, name in enumerate(class_names):
        if name.lower() in ["plane", "airplane", "aircraft", "aeroplane"]:
            plane_class_ids.add(idx)

    print(f"   Plane class IDs: {plane_class_ids}")

    all_images = get_images_from_splits(dataset_path)
    plane_images = []
    non_plane_images = []

    for img_path, lbl_path in all_images:
        classes_in_image = get_label_classes(lbl_path)

        if classes_in_image & plane_class_ids:
            # Image contains a plane
            plane_images.append(img_path)
        else:
            # Image has vehicles, people, baggage, etc. (no planes)
            non_plane_images.append(img_path)

    random.shuffle(plane_images)
    random.shuffle(non_plane_images)

    selected_planes = plane_images[:max_planes]
    selected_non_planes = non_plane_images[:max_non_planes]

    print(f"   Total airport images: {len(all_images)}")
    print(f"   Plane images found: {len(plane_images)} → selected {len(selected_planes)}")
    print(f"   Non-plane images found: {len(non_plane_images)} → selected {len(selected_non_planes)}")

    return selected_planes, selected_non_planes


# ── COLLECT IMAGES FROM SIMPLE DATASETS ────────────────────
def collect_images(dataset_path, count):
    """Randomly select 'count' images from all splits"""
    all_images = [img for img, _ in get_images_from_splits(dataset_path)]
    random.shuffle(all_images)
    selected = all_images[:min(count, len(all_images))]
    return selected


# ── CREATE THE DEMO DATASET ───────────────────────────────
DEMO = "/content/demo_runway_images"

# Clean old folder
if os.path.exists(DEMO):
    shutil.rmtree(DEMO)
os.makedirs(DEMO, exist_ok=True)

print("\n" + "="*50)
print("  BUILDING BALANCED DEMO DATASET (~200 images)")
print("="*50)

all_demo_images = []  # List of (src_path, prefix) tuples

# 1. CRACKS - 55 images (runway maintenance is key)
print("\n📦 Dataset 1: Runway Cracks")
crack_imgs = collect_images(dataset1.location, 55)
for img in crack_imgs:
    all_demo_images.append((img, "crack"))
print(f"   ✅ Selected {len(crack_imgs)} crack images")

# 2. FOD (Foreign Object Debris) - 50 images
print("\n📦 Dataset 2: Foreign Object Debris")
fod_imgs = collect_images(dataset2.location, 50)
for img in fod_imgs:
    all_demo_images.append((img, "fod"))
print(f"   ✅ Selected {len(fod_imgs)} FOD images")

# 3. AIRPORT - 5 planes + 30 non-plane (vehicles, people, baggage)
print("\n📦 Dataset 3: Airport Detection (smart filtering)")
plane_imgs, non_plane_imgs = filter_airport_images(
    dataset3.location, max_planes=5, max_non_planes=30
)
for img in plane_imgs:
    all_demo_images.append((img, "plane"))
for img in non_plane_imgs:
    all_demo_images.append((img, "airport"))
print(f"   ✅ Selected {len(plane_imgs)} plane + {len(non_plane_imgs)} non-plane images")

# 4. BIRDS - 35 images
print("\n📦 Dataset 4: Bird Detection")
bird_imgs = collect_images(dataset4.location, 35)
for img in bird_imgs:
    all_demo_images.append((img, "bird"))
print(f"   ✅ Selected {len(bird_imgs)} bird images")

# 5. ANIMALS (Wildlife) - 30 images
print("\n📦 Dataset 5: Animals / Wildlife")
animal_imgs = collect_images(dataset5.location, 30)
for img in animal_imgs:
    all_demo_images.append((img, "animal"))
print(f"   ✅ Selected {len(animal_imgs)} animal images")


# ── SHUFFLE SO CATEGORIES ARE INTERLEAVED ──────────────────
random.shuffle(all_demo_images)

# ── COPY WITH NUMBERED NAMES FOR CLEAN ORDER ──────────────
print("\n" + "="*50)
print("  COPYING & SHUFFLING IMAGES")
print("="*50)

for idx, (src_path, prefix) in enumerate(all_demo_images, 1):
    ext = os.path.splitext(src_path)[1]
    original_name = os.path.basename(src_path)
    dst_name = f"{idx:03d}_{prefix}_{original_name}"
    dst_path = os.path.join(DEMO, dst_name)
    shutil.copy(src_path, dst_path)

print(f"\n✅ Copied {len(all_demo_images)} images to {DEMO}")

# ── PRINT SUMMARY ──────────────────────────────────────────
from collections import Counter
categories = Counter(prefix for _, prefix in all_demo_images)

print("\n" + "="*50)
print("  📊 FINAL DATASET SUMMARY")
print("="*50)
for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
    bar = "█" * count
    print(f"  {cat:>10}: {count:>3} images  {bar}")
print(f"  {'TOTAL':>10}: {len(all_demo_images)} images")
print("="*50)

# ── ZIP AND DOWNLOAD ───────────────────────────────────────
shutil.make_archive('/content/demo_runway_images', 'zip', DEMO)

from google.colab import files
files.download('/content/demo_runway_images.zip')
print("\n✅ demo_runway_images.zip downloaded!")
print("📁 Extract and replace your local demo_runway_images folder")
