import os
import io
import cv2
from pyzbar.pyzbar import decode
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaIoBaseDownload

# Google Drive API Setup
SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = "red-cable-432116-s7-158775410657.json"  # Your credentials file

def authenticate_drive():
    """Authenticate and return the Google Drive service."""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build("drive", "v3", credentials=credentials)

def get_latest_jpg(service, folder_id):
    """Find the latest JPG file in the given Google Drive folder."""
    query = f"'{folder_id}' in parents and (mimeType='image/jpeg')"
    results = service.files().list(q=query, orderBy="createdTime desc",
                                   fields="files(id, name, createdTime)").execute()
    
    files = results.get("files", [])
    if not files:
        print("No JPG files found.")
        return None
    
    latest_file = files[0]  # Get the most recent JPG file
    print(f"Downloading latest file: {latest_file['name']}")
    return latest_file

def download_file(service, file_id, file_name):
    """Download a file from Google Drive into the 'qr' directory."""
    qr_dir = os.path.join(os.getcwd(), "qr")
    os.makedirs(qr_dir, exist_ok=True)  # Ensure the directory exists
    
    file_path = os.path.join(qr_dir, file_name)
    request = service.files().get_media(fileId=file_id)
    
    with open(file_path, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
    
    print(f"File downloaded: {file_path}")
    return file_path

def read_qr_code(image_path):
    """Decode QR code from the given image."""
    image = cv2.imread(image_path)
    decoded_objects = decode(image)

    for obj in decoded_objects:
        try:
            return obj.data.decode('utf-8', errors='replace')  # Correct encoding
        except UnicodeDecodeError:
            return obj.data.decode('latin-1', errors='replace')
    
    return None

def save_qr_data(qr_data, image_name):
    """Save QR code data to a text file under /qrbill/."""
    save_dir = os.path.join(os.getcwd(), "qrbill")
    os.makedirs(save_dir, exist_ok=True)  # Ensure the directory exists
    
    txt_filename = os.path.splitext(image_name)[0] + ".txt"  # Change .jpg to .txt
    txt_path = os.path.join(save_dir, txt_filename)
    
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(qr_data)
    
    print(f"QR Code data saved at: {txt_path}")

if __name__ == "__main__":
    folder_id = "1rvNrhacWZOd3tIAz0sZ6mClhfEEsUKLX"  # Replace with your Google Drive folder ID
    service = authenticate_drive()

    latest_jpg = get_latest_jpg(service, folder_id)
    if latest_jpg:
        file_path = download_file(service, latest_jpg["id"], latest_jpg["name"])  # Save under 'qr' directory
        qr_data = read_qr_code(file_path)
        
        if qr_data:
            print("QR Code Data:", qr_data)
            save_qr_data(qr_data, latest_jpg["name"])  # Save the data
        else:
            print("No QR code found.")
