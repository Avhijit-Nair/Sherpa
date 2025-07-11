import io
import fitz

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload


credentials = service_account.Credentials.from_service_account_file('D:/Sherpa/Zoom Backend/zoom-transcript-analyzer-b657750892d4.json')
drive_service = build('drive', 'v3', credentials=credentials)

file_id = '1yl9LKfBGuRv1NyVd-UjQoChhm3wlD56D'
request = drive_service.files().get_media(fileId=file_id)
fh = io.BytesIO() # this can be used to keep in memory
# fh = io.FileIO('file.tar.gz', 'wb') # this can be used to write to disk
downloader = MediaIoBaseDownload(fh, request)
done = False
while done is False:
    try:
        status, done = downloader.next_chunk()
        print("Download %d%%." % int(status.progress() * 100))
        pdf_document = fitz.open(stream=fh, filetype="pdf")
        text = ""
        for page in pdf_document:
            text += page.get_text("text") + "\n"
        print(text)
    except HttpError as error:
        print(f"An error occurred: {error}")
        done = True