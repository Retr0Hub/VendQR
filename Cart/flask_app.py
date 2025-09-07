import os
import qrcode
import uuid
import hmac
import hashlib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Directories for QR codes and bills
QR_DIR = os.path.join("static", "qrcodes")
BILL_DIR = os.path.join("static", "bill")

# Ensure directories exist
os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(BILL_DIR, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "YourFallbackSecretKey").encode()

def generate_order_id():
    """Generate a unique order ID using UUID"""
    return str(uuid.uuid4())[:8]

def generate_hash(order_id, order_info):
    """Generate HMAC hash for order validation"""
    data = f"{order_id}|{order_info}"
    return hmac.new(SECRET_KEY, data.encode(), hashlib.sha256).hexdigest()

@app.route("/generate-qrcode", methods=["POST"])
def generate_qr():
    app.logger.debug("Received request to generate QR code.")

    try:
        data = request.json
        if not data or "order_info" not in data:
            app.logger.error("No data provided in request or 'order_info' key is missing.")
            return jsonify({"error": "No data provided"}), 400

        order_info = data["order_info"]
        order_id = generate_order_id()  # Unique order ID
        hash_id = generate_hash(order_id, order_info)  # Hash for validation

        qr_data = f"{hash_id}\n{order_info}"  # Data encoded in QR
        qr_path = os.path.join(QR_DIR, f"{order_id}.png")
        
        # Generate and save QR code
        qr = qrcode.make(qr_data)
        qr.save(qr_path)

        # Save order info to a text file
        txt_path = os.path.join(BILL_DIR, f"{hash_id}.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(f"{order_id},\n {order_info}")

        app.logger.debug(f"QR Code saved at: {qr_path}, Order info saved at: {txt_path}")

        return jsonify({"message": "QR Code generated", "url": f"/qrcodes/{order_id}.png"})

    except Exception as e:
        app.logger.error(f"Error generating QR code: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/latest-qr", methods=["GET"])
def get_latest_qr():
    """Fetch the most recent QR code"""
    qr_files = sorted(
        [f for f in os.listdir(QR_DIR) if f.endswith(".png")],
        key=lambda x: os.path.getctime(os.path.join(QR_DIR, x)),
        reverse=True,
    )

    if not qr_files:
        return jsonify({"error": "No QR codes found"}), 404

    latest_qr = qr_files[0]
    return jsonify({"qr_code_path": f"/qrcodes/{latest_qr}"})

@app.route('/qrcodes/<filename>')
def serve_qr_code(filename):
    """Serve QR code images"""
    return send_from_directory(QR_DIR, filename)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
