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
client = genai.Client(api_key="AIzaSyCZfFSUDrj5U8OP4aTxWKK2peh5Fsx-9pY")
model_id = "gemini-2.5-flash-preview-05-20"

# configure service account
credentials = service_account.Credentials.from_service_account_info({
  "type": "service_account",
  "project_id": "zoom-transcript-analyzer",
  "private_key_id": "b657750892d4c0147164e4dcea45467a4d073cee",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCkJoReFw04WwAR\n6WMLgnn9Z6TX/MJJUjJoDWDu5Mi2HTqp70Ig5KtkSnZdUZbkLn6EK9Xrw20kYnEb\ncbhDROESpk5VFEUzk8yxOLmJskcyKrD31ssJ7pUSU3ANAJ+txPS0t5gWCmALhsb3\n1oVNBlbSgJrjsmJIyTmNocXLXguvDk0JpHO5csyjOzQefBOq1P8syDQwtNYko+zp\nyqROOgf6qVVM5JrJ29tliNB8bImLpkF7NGrLcgXTiJQtCarW5nAGj2lDIulDuc1u\n3bQz4lH0v7TJjWWldf6OyHRpXaUj3neOtF+QquqJAqVjKiJbyGNRPC3/Z0wqDf7f\nfHxZUz+5AgMBAAECggEAIrha6yPpEfB9lUxOPNL+RpEzltPJrISMUOHzjNQreAm6\nrNMEo7x6XB475wUo617CN+alutZ9MWL5FZr6JJBfIvi2PNyqvnwWoa2j4PIqiPvq\nrqFqFNG4CkZHvxhQrgqoz8i9jHvpUMbTMvzW+THMD35QRLUogMi/OavsEFX2FrKS\nkroJPLw1+B9M053Zk0bEVhB4nLJnJbxJYa0YJzwZZ9leGQzogLczR5HnvcaFZ4rN\nERNEwm+am041hBEhV5P6MS3mfTvrrzL+6fZpStVoYSffU+EmxdoOnn2PVmduSYCB\nuLFQFPbMSDSDZTY329TxmOkn87/J0i0F8/E/hWR74QKBgQDhLZIolyOnhkTRpRVs\nDflm9KoAbsr7Yt2ynptkAkbFwaRyySX7mxlDd2W5q9MrSzmn8WRBlr8+cR3KieRp\n+ItRSgLxE/yVW9sDux/LDE3GRIt89DzChNqWN+gK2336TG45YdsojQwBEAgLioCL\nQ3Uoa2hhkEnrbgFqBlwCVL6sDQKBgQC6nn0clL7co7d3SfabeiHQ79H94kmFNjSb\neMETYITF0yxxmFYHWQUT1an0EH4f+itJWoeMfnOseoVdtOZKDWyhubP1q4p62h4h\nVRauODA0167yI/qQwHxMlzcHfbf8YMAAP8b9y8INNSaPxJ0WFBAOD4zwuZTfRrn0\nTwC41Vb7XQKBgEWvzr3VGGmt+fpPdrO8F2UvbrU3lIX78NRolXp74d8tsHD9o02c\nkFL6znaJoI6Td0JsSDSsLH9sjmWyCwhorOT5XLOzFcY7aSpcbNhv9FnZuLlw9KTW\nbLd0kdFaYEBoCuyjRinkjMR/a532vRVcSRO7OdCH0PiVUMa5NRxbka65AoGAXdUC\nozRHIzlOLjSKQnKOPjfXJgh5Xvl6ShHVQqDtIWqklhk6aEdiPi7YXVdNk1Z+HUvf\ni8yo7LhOBmfGwsUtMcPlsEioQE0biTb3SHIICwnHdQiSG+YsmXYOvT2BHOyonXdz\n3nhtAacP1InPUiKUT/2RqBgnunwdU7HFcyoRqiECgYAVZSTQWMbSrcW3uYN7Nzjk\nRwsHvttrVcaXM8LVq7seNZffdwSdLDLGptDJwYTWz4vApjSufa3fqiEgi6nixKtd\nlVT4qMaVuCLfnvp41DqGhFjX6o1kPbxo5Z/JyYcDmKNmGfqYRMWv+HMOPwlrlBzb\nrfgjMhCvkCvaDPSbk3z2rg==\n-----END PRIVATE KEY-----\n",
  "client_email": "meeting-insight-app@zoom-transcript-analyzer.iam.gserviceaccount.com",
  "client_id": "102702924345202895439",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/meeting-insight-app%40zoom-transcript-analyzer.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
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