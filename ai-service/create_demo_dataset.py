from roboflow import Roboflow
import os, shutil, random, yaml
from collections import Counter

rf = Roboflow(api_key="WASiObfwSdzotctxlYxb")

dataset1 = rf.workspace("priyanka-wadhwani").project("runway-crack-detection-0xwrs-fjvlu").version(1).download("yolov8")
dataset2 = rf.workspace("priyanka-wadhwani").project("fod-i2kfx-1sdqh").version(2).download("yolov8")
dataset3 = rf.workspace("priyanka-wadhwani").project("airport-detection-gehvq-1ctpq").version(1).download("yolov8")
dataset4 = rf.workspace("priyanka-wadhwani").project("yolov8_bird_detection-e61nk-9viaj").version(1).download("yolov8")
dataset5 = rf.workspace("priyanka-wadhwani").project("animals-dataset-mi6gl-hquf0").version(1).download("yolov8")

print("✅ All datasets downloaded!\n")


def get_class_names(dataset_path):
    yaml_path = os.path.join(dataset_path, "data.yaml")
    if os.path.exists(yaml_path):
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
        return data.get("names", [])
    return []


def get_label_classes(label_path):
    classes = set()
    if os.path.exists(label_path):
        with open(label_path, "r") as f:
            for line in f:
                parts = line.strip().split()
                if parts:
                    classes.add(int(parts[0]))
    return classes


def get_images_from_splits(dataset_path):
    all_images = []
    for split in ["train", "valid", "test"]:
        img_dir = os.path.join(dataset_path, split, "images")
        lbl_dir = os.path.join(dataset_path, split, "labels")
        if os.path.exists(img_dir):
            for img in os.listdir(img_dir):
                if img.lower().endswith((".jpg", ".jpeg", ".png")):
                    img_path = os.path.join(img_dir, img)
                    lbl_name = os.path.splitext(img)[0] + ".txt"
                    lbl_path = os.path.join(lbl_dir, lbl_name)
                    all_images.append((img_path, lbl_path))
    return all_images


def filter_airport_images(dataset_path, max_planes=5, max_non_planes=35):
    class_names = get_class_names(dataset_path)
    plane_class_ids = set()
    for idx, name in enumerate(class_names):
        if name.lower() in ["plane", "airplane", "aircraft", "aeroplane"]:
            plane_class_ids.add(idx)

    all_images = get_images_from_splits(dataset_path)
    plane_images = []
    non_plane_images = []

    for img_path, lbl_path in all_images:
        classes_in_image = get_label_classes(lbl_path)

        if classes_in_image & plane_class_ids:
            plane_images.append(img_path)
        else:
            non_plane_images.append(img_path)

    random.shuffle(plane_images)
    random.shuffle(non_plane_images)

    selected_planes = plane_images[:max_planes]
    selected_non_planes = non_plane_images[:max_non_planes]

    return selected_planes, selected_non_planes


# Collect images from datasets
def collect_images(dataset_path, count):
    all_images = [img for img, _ in get_images_from_splits(dataset_path)]
    random.shuffle(all_images)
    selected = all_images[:min(count, len(all_images))]
    return selected


# Create demo dataset
DEMO = "/content/demo_runway_images"

if os.path.exists(DEMO):
    shutil.rmtree(DEMO)
os.makedirs(DEMO, exist_ok=True)

all_demo_images = []

crack_imgs = collect_images(dataset1.location, 55)
for img in crack_imgs:
    all_demo_images.append((img, "crack"))

fod_imgs = collect_images(dataset2.location, 50)
for img in fod_imgs:
    all_demo_images.append((img, "fod"))

plane_imgs, non_plane_imgs = filter_airport_images(
    dataset3.location, max_planes=5, max_non_planes=30
)
for img in plane_imgs:
    all_demo_images.append((img, "plane"))
for img in non_plane_imgs:
    all_demo_images.append((img, "airport"))

bird_imgs = collect_images(dataset4.location, 35)
for img in bird_imgs:
    all_demo_images.append((img, "bird"))

animal_imgs = collect_images(dataset5.location, 30)
for img in animal_imgs:
    all_demo_images.append((img, "animal"))

random.shuffle(all_demo_images)

for idx, (src_path, prefix) in enumerate(all_demo_images, 1):
    ext = os.path.splitext(src_path)[1]
    original_name = os.path.basename(src_path)
    dst_name = f"{idx:03d}_{prefix}_{original_name}"
    dst_path = os.path.join(DEMO, dst_name)
    shutil.copy(src_path, dst_path)

categories = Counter(prefix for _, prefix in all_demo_images)

for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"  {cat:>10}: {count:>3} images")

shutil.make_archive('/content/demo_runway_images', 'zip', DEMO)

try:
    from google.colab import files
    files.download('/content/demo_runway_images.zip')
except ImportError:
    pass
