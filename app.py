import os
import json
from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from google.cloud import spanner
from werkzeug.utils import secure_filename
import openpyxl

app = Flask(__name__, static_folder='client/assets', template_folder='templates')

# Set the environment variable for Google Application Credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\dudzi\Downloads\buckbuddiesapp-firebase-adminsdk-djci7-4e99168191.json'
cred = credentials.Certificate(r'C:\Users\dudzi\Downloads\buckbuddiesapp-firebase-adminsdk-djci7-4e99168191.json')
firebase_admin.initialize_app(cred)

# Initialize Spanner client
spanner_client = spanner.Client()
instance_id = 'newdatabase'
database_id = 'newdb'
instance = spanner_client.instance(instance_id)
database = instance.database(database_id)

# Ensure the upload folder exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/storeUserInfo', methods=['POST'])
def store_user_info():
    # Authentication logic
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(" ")[1]
    user_info = auth.verify_id_token(token)
    email = user_info['email']
    print(email)
    print(user_info['uid'])

    # Insert user info into Spanner
    with database.batch() as batch:
        batch.insert(
            table='users',
            columns=('user_id', 'email'),
            values=[
                (user_info['uid'], email)
            ]
        )

    return jsonify({"status": "success"}), 200

@app.route('/content_cockpit.html')
def index():
    return render_template('content_cockpit.html')

@app.route('/bank.html')
def bank():
    return render_template('bank.html')

@app.route('/authentication/sign-up.html')
def sign_up_page():
    return render_template('authentication/sign-up.html')

@app.route('/authentication/sign-in.html')
def sign_in_page():
    return render_template('authentication/layouts/corporate/sign-in.html')

@app.route('/authentication/new-password.html')
def new_password_page():
    return render_template('authentication/layouts/corporate/new-password.html')

@app.route('/authentication/reset-password.html')
def reset_password_page():
    return render_template('authentication/layouts/corporate/reset-password.html')

# Endpoint to upload and process Excel file
@app.route('/upload', methods=['POST'])
def upload_file():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(" ")[1]
    user_info = auth.verify_id_token(token)
    user_id = user_info['uid']

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.xlsx'):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process the uploaded file
        try:
            workbook = openpyxl.load_workbook(file_path)
            sheet = workbook.active
            rows = list(sheet.iter_rows(values_only=True))

            # Insert data into Spanner
            with database.batch() as batch:
                for row in rows:
                    # Assuming your Excel file has columns that match the Spanner table columns
                    batch.insert_or_update(
                        table='user_data',  # Replace with your actual table name
                        columns=('user_id', 'budget'),  # Replace with actual column names
                        values=[
                            (user_id, row[0])  # Adjust according to your data structure
                        ]
                    )

            return jsonify({'message': 'File uploaded and processed successfully'}), 200
        except Exception as e:
            print(f"Error processing file: {e}")
            return jsonify({'error': 'Error processing file'}), 500

    return jsonify({'error': 'Invalid file format'}), 400

# Endpoint to fetch user-specific data
@app.route('/getUserData', methods=['GET'])
def get_user_data():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(" ")[1]
    user_info = auth.verify_id_token(token)
    user_id = user_info['uid']

    with database.snapshot() as snapshot:
        try:
            results = snapshot.execute_sql(
                "SELECT * FROM user_data WHERE user_id = @user_id",
                params={"user_id": user_id},
                param_types={"user_id": spanner.param_types.STRING}
            )
            user_data = []
            for row in results:
                user_data.append({
                    'budget': row[1]
                })
            return jsonify(user_data), 200
        except Exception as e:
            print(f"Error fetching user data: {e}")
            return jsonify({'error': 'Error fetching user data'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
