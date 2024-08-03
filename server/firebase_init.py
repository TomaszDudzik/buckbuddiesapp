import firebase_admin
from firebase_admin import credentials
from google.cloud import secretmanager
import tempfile
import json

# def get_service_account_key():
#     client = secretmanager.SecretManagerServiceClient()
#     name = "projects/483445476447/secrets/firebase-service-account-key/versions/latest"
#     response = client.access_secret_version(name=name)
#     payload = response.payload.data.decode("UTF-8")
#     return payload

# # Get the service account key from Google Cloud Secret Manager
# service_account_key_json = get_service_account_key()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("C:/Users/dudzi/Downloads/buckbuddiesapp-firebase-adminsdk-djci7-4e99168191.json")
firebase_admin.initialize_app(cred)

