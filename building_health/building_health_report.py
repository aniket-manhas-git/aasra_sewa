import os
import logging
from ultralytics import YOLO
from PIL import Image
from fpdf import FPDF
from dotenv import load_dotenv
import urllib.request
import cloudinary.uploader
import cloudinary.api
import cloudinary
from pymongo import MongoClient
from bson import ObjectId
import sys
import time

# Import configuration
from config import *

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Cloudinary configuration
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

# MongoDB setup - Use the same connection string as the Node.js backend
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
properties_collection = db[COLLECTION_NAME]

# Create directories if they don't exist
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)


def download_image(image_url, save_path):
    urllib.request.urlretrieve(image_url, save_path)
    logging.info(f"📥 Downloaded image to {save_path}")
    return save_path


def detect_cracks(image_path):
    model = YOLO(YOLO_MODEL_PATH)
    results = model(image_path)

    crack_count = 0
    confidences = []

    for box in results[0].boxes:
        if int(box.cls[0]) == 0:
            crack_count += 1
            confidences.append(float(box.conf[0]))

    img_with_boxes = results[0].plot()
    processed_path = os.path.join(PROCESSED_DIR, os.path.basename(image_path))
    Image.fromarray(img_with_boxes).save(processed_path)

    logging.info(f"🔍 {os.path.basename(image_path)} → {crack_count} cracks detected")

    return processed_path, crack_count, confidences


def generate_analysis(image_scores, avg_score):
    analysis = "AI-Based Structural Crack Analysis:\n"
    analysis += f"\nOverall Average Score (out of 10): {avg_score:.1f}\n\n"
    for wall, score in image_scores.items():
        analysis += f"- {wall.title()} Wall: {score:.1f}/10\n"

    if avg_score < 4:
        severity = "High"
        recommendation = "Immediate structural inspection and repair is recommended."
    elif avg_score < 7:
        severity = "Medium"
        recommendation = "Monitor the structure and consider a professional inspection."
    else:
        severity = "Low"
        recommendation = "Structure is likely healthy. No immediate action needed."

    analysis += f"\nSeverity Level: {severity}\nRecommendation: {recommendation}"
    return analysis


def generate_pdf_report(image_data, property_id, analysis):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Building Health Inspection Report", ln=True, align="C")

    img_count = 0
    for wall, img_path in image_data.items():
        if img_count > 0 and img_count % 2 == 0 and img_count // 2 < 4:
            pdf.add_page()
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"{wall.title()} Wall", ln=True)
        pdf.image(img_path, w=120)
        img_count += 1

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "\nAI-Based Risk Analysis", ln=True)
    pdf.set_font("Arial", "", 12)

    safe_analysis = analysis.encode('latin-1', errors='ignore').decode('latin-1')
    pdf.multi_cell(0, 10, safe_analysis)

    pdf_path = os.path.join(PDF_DIR, f"{property_id}_health_report.pdf")
    pdf.output(pdf_path)

    # Wait for file to be fully written and check size
    last_size = -1
    for _ in range(10):
        if os.path.exists(pdf_path):
            size = os.path.getsize(pdf_path)
            print(f"[DEBUG] PDF exists: {pdf_path}, size: {size} bytes")
            if size == last_size and size > 0:
                break
            last_size = size
        time.sleep(0.1)
    else:
        print(f"[ERROR] PDF file not ready or is empty: {pdf_path}")

    logging.info(f"📄 PDF saved at {pdf_path} (size: {os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 'N/A'} bytes)")
    return pdf_path


def upload_pdf_to_cloudinary(pdf_path):
    try:
        # Extra check before upload
        if not os.path.exists(pdf_path) or os.path.getsize(pdf_path) == 0:
            logging.error(f"❌ PDF file does not exist or is empty: {pdf_path}")
            return None
        print(f"[DEBUG] Uploading PDF: {pdf_path}, size: {os.path.getsize(pdf_path)} bytes")
        result = cloudinary.uploader.upload(
            pdf_path,
            resource_type="raw",
            type="upload"  # Force public upload
        )
        cloud_url = result.get("secure_url")
        logging.info(f"☁️ Uploaded PDF to Cloudinary: {cloud_url}")
        return cloud_url
    except Exception as e:
        logging.error(f"❌ Cloudinary upload failed: {e}")
        return None


def update_property_pdf(property_id, pdf_url):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(property_id):
            logging.error(f"❌ Invalid ObjectId format: {property_id}")
            return False
            
        object_id = ObjectId(property_id)
        
        # First, check if the property exists
        property_exists = properties_collection.find_one({"_id": object_id})
        if not property_exists:
            logging.error(f"❌ Property with ID {property_id} not found in database")
            return False
        
        # Update the property with the PDF URL
        result = properties_collection.update_one(
            {"_id": object_id},
            {"$set": {"healthReportPDF": pdf_url}}
        )
        
        if result.matched_count > 0 and result.modified_count > 0:
            logging.info(f"✅ PDF URL successfully updated in MongoDB for property {property_id}")
            return True
        elif result.matched_count > 0:
            logging.warning(f"⚠️ Property found but no changes made for ID {property_id}")
            return False
        else:
            logging.error(f"❌ No property found with ID {property_id}")
            return False
            
    except Exception as e:
        logging.error(f"❌ Failed to update MongoDB: {e}")
        return False


def generate_building_health_report(image_urls_dict, property_id):
    if not (4 <= len(image_urls_dict) <= 6):
        raise ValueError("Number of images must be between 4 and 6.")

    local_image_paths = {}
    image_scores = {}
    total_score = 0
    total_confidences = []

    for wall, url in image_urls_dict.items():
        img_local_path = os.path.join(PROCESSED_DIR, f"{property_id}_{wall}.jpg")
        download_image(url, img_local_path)

        processed_img_path, crack_count, confidences = detect_cracks(img_local_path)
        local_image_paths[wall] = processed_img_path

        score = 10 - crack_count * 1.5
        score = max(0, min(10, score))
        image_scores[wall] = score
        total_score += score
        total_confidences.extend(confidences)

    avg_score = total_score / len(image_scores)
    analysis = generate_analysis(image_scores, avg_score)

    pdf_path = generate_pdf_report(local_image_paths, property_id, analysis)
    cloud_url = upload_pdf_to_cloudinary(pdf_path)

    if cloud_url:
        logging.info(f"✅ Successfully generated health report PDF: {cloud_url}")
        
        # Only try to update database if it's a real property ID (not temporary)
        if not property_id.startswith("temp_"):
            success = update_property_pdf(property_id, cloud_url)
            if success:
                logging.info(f"✅ Successfully stored PDF URL for property {property_id}")
            else:
                logging.error(f"❌ Failed to store PDF URL for property {property_id}")
        else:
            logging.info(f"📝 Using temporary ID {property_id} - PDF URL will be saved with property")
    else:
        logging.error("❌ Failed to upload PDF to Cloudinary")

    return cloud_url


# Main execution for command line usage
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python building_health_report.py <image_json> <property_id>")
        sys.exit(1)
    
    try:
        import json
        image_json = sys.argv[1]
        property_id = sys.argv[2]
        
        image_urls_dict = json.loads(image_json)
        result = generate_building_health_report(image_urls_dict, property_id)
        
        if result:
            print(f"✅ Health report generated successfully: {result}")
        else:
            print("❌ Failed to generate health report")
            sys.exit(1)
            
    except Exception as e:
        logging.error(f"❌ Error in main execution: {e}")
        sys.exit(1)
