from flask import Flask, request, jsonify
from flask_cors import CORS
from building_health_report import generate_building_health_report
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

@app.route("/", methods=["GET"])
def home():
    return "🏗️ Building Health Analysis Server Running"

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        images = data.get("images")
        property_id = data.get("propertyId")

        if not images or not property_id:
            return jsonify({"message": "Missing image data or property ID"}), 400

        cloudinary_pdf_url = generate_building_health_report(images, property_id)

        if not cloudinary_pdf_url:
            return jsonify({"message": "Cloudinary upload failed."}), 500

        return jsonify({
            "message": "Analysis complete.",
            "pdf_url": cloudinary_pdf_url
        }), 200
    except Exception as e:
        logging.error(f"❌ Error in /analyze: {e}")
        return jsonify({"message": "Analysis failed"}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
