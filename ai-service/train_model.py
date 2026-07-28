# ============================================================
# 🚀 AAI RUNWAY - PROPER MODEL TRAINING SCRIPT
# Run this in Google Colab (GPU runtime required)
# ============================================================
# 
# THE PROBLEM: Each Roboflow dataset has its own class IDs (0,1,2...)
# When you merge them without remapping, class 0 from cracks gets
# confused with class 0 from FOD, class 0 from airport, etc.
#
# THIS SCRIPT: Downloads all datasets, reads each one's class map,
# builds a unified class map, remaps ALL label files, then trains.
# ============================================================

# ── STEP 0: Install dependencies ───────────────────────────
# !pip install roboflow ultralytics -q

from roboflow import Roboflow
from ultralytics import YOLO
import os, shutil, yaml, random, glob

# ── STEP 1: Download all datasets ──────────────────────────
print("="*60)
print("  STEP 1: DOWNLOADING DATASETS FROM ROBOFLOW")
print("="*60)

rf = Roboflow(api_key="WASiObfwSdzotctxlYxb")

datasets = {
    "cracks": rf.workspace("priyanka-wadhwani").project("runway-crack-detection-0xwrs-fjvlu").version(1).download("yolov8"),
    "fod":    rf.workspace("priyanka-wadhwani").project("fod-i2kfx-1sdqh").version(2).download("yolov8"),
    "airport": rf.workspace("priyanka-wadhwani").project("airport-detection-gehvq-1ctpq").version(1).download("yolov8"),
    "birds":  rf.workspace("priyanka-wadhwani").project("yolov8_bird_detection-e61nk-9viaj").version(1).download("yolov8"),
    "animals": rf.workspace("priyanka-wadhwani").project("animals-dataset-mi6gl-hquf0").version(1).download("yolov8"),
}

print("\n✅ All datasets downloaded!\n")


# ── STEP 2: Read each dataset's class mapping ─────────────
print("="*60)
print("  STEP 2: READING CLASS MAPPINGS FROM EACH DATASET")
print("="*60)

dataset_classes = {}  # { "cracks": {0: "L1_Hole", 1: "L2_Hole", ...}, ... }

for name, ds in datasets.items():
    yaml_path = os.path.join(ds.location, "data.yaml")
    with open(yaml_path, "r") as f:
        data = yaml.safe_load(f)
    
    names = data.get("names", [])
    # Handle both list format and dict format
    if isinstance(names, list):
        class_map = {i: n for i, n in enumerate(names)}
    elif isinstance(names, dict):
        class_map = {int(k): v for k, v in names.items()}
    else:
        class_map = {}
    
    dataset_classes[name] = class_map
    print(f"\n📦 {name} ({ds.location}):")
    for idx, cls_name in sorted(class_map.items()):
        print(f"   class {idx} → {cls_name}")


# ── STEP 3: Build UNIFIED class mapping ───────────────────
print("\n" + "="*60)
print("  STEP 3: BUILDING UNIFIED CLASS MAP")
print("="*60)

# Collect ALL unique class names across all datasets
all_class_names = set()
for class_map in dataset_classes.values():
    all_class_names.update(class_map.values())

# Sort them in a logical order for the unified map
# Group by category for clean organization
ORDERED_CLASSES = [
    # Runway damage (cracks dataset)
    "L1_Hole", "L2_Hole", "L3_Hole", "mildcracks", "severecracks",
    # Foreign objects (FOD dataset)
    "obj",
    # Airport objects (airport dataset)
    "person", "plane", "vehicle",
    # Birds (bird dataset)
    "bird", "Bird", "Platalea",
    # Animals (animals dataset)
    "Dog", "Cat", "Cow", "Elephant", "Sheep", "Pig", "Giraffe", "Deer",
]

# Build unified map: only include classes that actually exist in our datasets
unified_classes = []
for cls in ORDERED_CLASSES:
    if cls in all_class_names:
        unified_classes.append(cls)

# Add any remaining classes we might have missed
for cls in sorted(all_class_names):
    if cls not in unified_classes:
        unified_classes.append(cls)

# Create the unified mapping: class_name → new_id
unified_map = {name: idx for idx, name in enumerate(unified_classes)}

print(f"\n📋 Unified class map ({len(unified_classes)} classes):")
for idx, name in enumerate(unified_classes):
    print(f"   {idx:>2} → {name}")


# ── STEP 4: Build remap tables per dataset ─────────────────
print("\n" + "="*60)
print("  STEP 4: COMPUTING CLASS ID REMAPPING TABLES")
print("="*60)

remap_tables = {}  # { "cracks": {0: 0, 1: 1, ...}, "fod": {0: 5}, ... }

for name, class_map in dataset_classes.items():
    remap = {}
    for old_id, cls_name in class_map.items():
        new_id = unified_map[cls_name]
        remap[old_id] = new_id
    remap_tables[name] = remap
    print(f"\n🔄 {name} remap:")
    for old_id, new_id in sorted(remap.items()):
        cls_name = class_map[old_id]
        print(f"   {old_id} → {new_id}  ({cls_name})")


# ── STEP 5: Merge datasets with remapped labels ───────────
print("\n" + "="*60)
print("  STEP 5: MERGING DATASETS WITH REMAPPED LABELS")
print("="*60)

MERGED_DIR = "/content/merged_dataset"

# Clean and create merged directory structure
if os.path.exists(MERGED_DIR):
    shutil.rmtree(MERGED_DIR)

for split in ["train", "valid"]:
    os.makedirs(f"{MERGED_DIR}/{split}/images", exist_ok=True)
    os.makedirs(f"{MERGED_DIR}/{split}/labels", exist_ok=True)

total_images = 0
total_labels_remapped = 0

for name, ds in datasets.items():
    remap = remap_tables[name]
    
    for split in ["train", "valid", "test"]:
        img_dir = os.path.join(ds.location, split, "images")
        lbl_dir = os.path.join(ds.location, split, "labels")
        
        if not os.path.exists(img_dir):
            continue
        
        # Map test split into valid for training
        target_split = "valid" if split == "test" else split
        
        for img_file in os.listdir(img_dir):
            if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            
            # Copy image with dataset prefix to avoid name collisions
            src_img = os.path.join(img_dir, img_file)
            dst_img = os.path.join(MERGED_DIR, target_split, "images", f"{name}_{img_file}")
            shutil.copy(src_img, dst_img)
            total_images += 1
            
            # Find and remap the label file
            lbl_name = os.path.splitext(img_file)[0] + ".txt"
            src_lbl = os.path.join(lbl_dir, lbl_name)
            dst_lbl = os.path.join(MERGED_DIR, target_split, "labels", f"{name}_{lbl_name}")
            
            if os.path.exists(src_lbl):
                with open(src_lbl, "r") as f:
                    lines = f.readlines()
                
                remapped_lines = []
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        old_class_id = int(parts[0])
                        if old_class_id in remap:
                            new_class_id = remap[old_class_id]
                            parts[0] = str(new_class_id)
                            remapped_lines.append(" ".join(parts) + "\n")
                            total_labels_remapped += 1
                
                with open(dst_lbl, "w") as f:
                    f.writelines(remapped_lines)
            else:
                # Create empty label file (no detections in this image)
                open(dst_lbl, "w").close()
    
    print(f"   ✅ {name}: merged")

print(f"\n📊 Total images: {total_images}")
print(f"📊 Total labels remapped: {total_labels_remapped}")

# Count per split
for split in ["train", "valid"]:
    count = len(os.listdir(f"{MERGED_DIR}/{split}/images"))
    print(f"   {split}: {count} images")


# ── STEP 6: Create unified data.yaml ──────────────────────
print("\n" + "="*60)
print("  STEP 6: CREATING UNIFIED data.yaml")
print("="*60)

data_yaml = {
    "path": MERGED_DIR,
    "train": "train/images",
    "val": "valid/images",
    "nc": len(unified_classes),
    "names": unified_classes,
}

yaml_path = os.path.join(MERGED_DIR, "data.yaml")
with open(yaml_path, "w") as f:
    yaml.dump(data_yaml, f, default_flow_style=False, sort_keys=False)

print(f"\n📄 Created: {yaml_path}")
print(f"   Classes: {len(unified_classes)}")
print(f"   Names: {unified_classes}")


# ── STEP 7: Verify the merge ──────────────────────────────
print("\n" + "="*60)
print("  STEP 7: VERIFYING MERGED DATASET")
print("="*60)

# Count class distribution in training labels
from collections import Counter
class_counts = Counter()

for lbl_file in glob.glob(f"{MERGED_DIR}/train/labels/*.txt"):
    with open(lbl_file, "r") as f:
        for line in f:
            parts = line.strip().split()
            if parts:
                class_id = int(parts[0])
                if class_id < len(unified_classes):
                    class_counts[unified_classes[class_id]] += 1

print("\n📊 Training set class distribution:")
for cls_name, count in sorted(class_counts.items(), key=lambda x: -x[1]):
    bar = "█" * min(count // 10, 50)
    print(f"   {cls_name:>15}: {count:>5}  {bar}")

total_annotations = sum(class_counts.values())
print(f"\n   Total annotations: {total_annotations}")


# ── STEP 8: TRAIN THE MODEL ───────────────────────────────
print("\n" + "="*60)
print("  STEP 8: TRAINING YOLOv8 MODEL")
print("="*60)
print("  This will take 30-60 minutes on Colab GPU")
print("="*60)

model = YOLO("yolov8n.pt")  # Start from pretrained YOLOv8-nano

results = model.train(
    data=yaml_path,
    epochs=50,               # 50 epochs (early stopping will kick in if no improvement)
    imgsz=640,               # Standard YOLO input size
    batch=16,                # Adjust if you get OOM errors (try 8)
    patience=20,             # Early stopping: stop if no improvement for 20 epochs
    lr0=0.01,                # Initial learning rate
    lrf=0.01,                # Final learning rate factor
    momentum=0.937,          # SGD momentum
    weight_decay=0.0005,     # L2 regularization
    warmup_epochs=5,         # Warmup for stable training start
    augment=True,            # Enable data augmentation
    mosaic=1.0,              # Mosaic augmentation (great for small objects)
    mixup=0.15,              # MixUp augmentation for better generalization
    hsv_h=0.015,             # HSV-Hue augmentation
    hsv_s=0.7,               # HSV-Saturation augmentation
    hsv_v=0.4,               # HSV-Value augmentation
    flipud=0.5,              # Vertical flip (runways can be any orientation)
    fliplr=0.5,              # Horizontal flip
    scale=0.5,               # Scale augmentation
    translate=0.1,           # Translation augmentation
    project="/content/training_runs",
    name="aai_runway_v2",
    exist_ok=True,
    verbose=True,
)


# ── STEP 9: Validate and show results ─────────────────────
print("\n" + "="*60)
print("  STEP 9: VALIDATION RESULTS")
print("="*60)

best_model = YOLO("/content/training_runs/aai_runway_v2/weights/best.pt")
metrics = best_model.val(data=yaml_path)

print(f"\n📊 Final Metrics:")
print(f"   mAP50:      {metrics.box.map50:.1%}")
print(f"   mAP50-95:   {metrics.box.map:.1%}")
print(f"   Precision:   {metrics.box.mp:.1%}")
print(f"   Recall:      {metrics.box.mr:.1%}")


# ── STEP 10: Download the trained model ───────────────────
print("\n" + "="*60)
print("  STEP 10: DOWNLOAD TRAINED MODEL")
print("="*60)

best_pt_path = "/content/training_runs/aai_runway_v2/weights/best.pt"
last_pt_path = "/content/training_runs/aai_runway_v2/weights/last.pt"

# Copy to easy download location
shutil.copy(best_pt_path, "/content/best.pt")

print(f"\n✅ Training complete!")
print(f"📁 Best model: {best_pt_path}")
print(f"\n⬇️  Download best.pt from the file browser on the left")
print(f"   Or run: files.download('/content/best.pt')")
print(f"\n📌 Then place best.pt in your ai-service/ folder")
print(f"   and upload to Google Drive to update the shared link")

# Auto-download
try:
    from google.colab import files
    files.download("/content/best.pt")
    print("\n✅ Download started!")
except:
    print("\n⚠️  Auto-download failed. Download manually from file browser.")
