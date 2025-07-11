import os
from flask import Flask, redirect, request, session, jsonify
from dotenv import load_dotenv
from google.generativeai import configure, GenerativeModel
from google import genai
from google.genai import types
from google.genai.types import Tool, GenerateContentConfig
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload
import fitz
import io
import requests
# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,  # must be true for cross-site
    MAX_CONTENT_LENGTH=50 * 1024 * 1024  # 50MB max file size
)
CORS(app, origins=["*"],allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials","Access-Control-Allow-Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
# app.secret_key = os.urandom(24)

# Configure Gemini
# configure(api_key=os.getenv("GEMINI_API_KEY"))
# gemini_model = GenerativeModel("gemini-2.5-flash-preview-05-20")
client = genai.Client(api_key="Gemini API key")
model_id = "gemini-2.5-flash-preview-05-20"

# configure service account
credentials = service_account.Credentials.from_service_account_info({
 "CREDENTIALS.JSON"
}
)
drive_service = build('drive', 'v3', credentials=credentials)
# Add explicit OPTIONS handler for preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        # response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    # response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_transcripts():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'OK'})
        return response
    
    try:
        transcript = ""
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided',
                'status': 'error'
            }), 400
        # Check if files are present in the request
        if 'files' not in data.keys():
            return jsonify({
                'error': 'No files provided',
                'status': 'error'
            }), 400
        
        # Get the prompt from form data
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({
                'error': 'Prompt is required',
                'status': 'error'
            }), 400
        
        # Get uploaded files
        file_urls = data.get('files', [])
        if not file_urls:
            return jsonify({
                'error': 'No files selected',
                'status': 'error'
            }), 400
        for fil_url in file_urls:
            if not fil_url.startswith('https://'):
                return jsonify({
                    'error': 'Invalid file URL',
                    'status': 'error'
                }), 400
            file_id = fil_url.split("/")[-2]
            drive_request = drive_service.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, drive_request)
            done = False
            while done is False:
                try:
                    status, done = downloader.next_chunk()
                    print("Download %d%%." % int(status.progress() * 100))
                    pdf_document = fitz.open(stream=fh, filetype="pdf")
                    for page in pdf_document:
                        transcript += page.get_text("text") + "\n"
                    # print(transcript)
                    fh.close()
                except HttpError as error:
                    print(f"An error occurred: {error}")
                    done = True
        gemini_prompt = prompt + "\n\n" + transcript
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=gemini_prompt
            )
            return jsonify({
                'status': 'success',
                'message': 'File processed successfully',
                'analysis': response.text
            }), 200
        except Exception as e:
            print(f"Error generating content: {str(e)}")
            return jsonify({
                'error': f'Content generation failed: {str(e)}',
                'status': 'error'
            }), 500
    except Exception as e:
        print(f"Error in analyze_transcripts: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/salesprep', methods=['POST', 'OPTIONS'])
def sales_prep():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'OK'})
        return response
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided',
                'status': 'error'
            }), 400
        
        # Get the prompt from form data
        linkedinURL = data.get('linkedinUrl')
        if not linkedinURL:
            return jsonify({
                'error': 'LinkedinURL is required',
                'status': 'error'
            }), 400
        
        # Get the prompt from form data
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({
                'error': 'Prompt is required',
                'status': 'error'
            }), 400
        # Get uploaded files
        presentations = data.get('presentations', [])
        if not presentations:
            return jsonify({
                'error': 'No ppt/pdf file selected',
                'status': 'error'
            }), 400
        
        salesContent = ""
        for pres_url in presentations:
            print(pres_url)
            file_id = pres_url['downloadUrl']
            drive_request = drive_service.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, drive_request)
            done = False
            while done is False:
                try:
                    status, done = downloader.next_chunk()
                    print("Download %d%%." % int(status.progress() * 100))
                    pdf_document = fitz.open(stream=fh, filetype="pdf")
                    for page in pdf_document:
                        salesContent += page.get_text("text") + "\n"
                    fh.close()
                except HttpError as error:
                    print(f"An error occurred: {error}")
                    done = True
        rapidApi_Url = "https://linkedin-data-scraper1.p.rapidapi.com/get_user_data.php"
        payload = {"username_or_url": linkedinURL}
        headers = {
            "x-rapidapi-key": os.getenv("RAPIDAPI_KEY"),
            "x-rapidapi-host": os.getenv("RAPIDAPI_HOST"),
            "Content-Type": "application/x-www-form-urlencoded"
        }
        response = requests.post(rapidApi_Url, data=payload, headers=headers)
        gemini_prompt = f"{prompt}\n\nLinkedin Content - {response.json()}\n\nSales Content - {salesContent}"
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=gemini_prompt
            )
            return jsonify({
                'status': 'success',
                'message': 'File processed successfully',
                'prepWork': response.text
            }), 200
        except Exception as e:
            print(f"Error generating content: {str(e)}")
            return jsonify({
                'error': f'Content generation failed: {str(e)}',
                'status': 'error'
            }), 500
    except Exception as e:
        print(f"Error in sales_prep: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'status': 'Failed'
        }), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    })

if __name__ == "__main__":
    app.run(debug=True)