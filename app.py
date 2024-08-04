import os
import yaml
import json
from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from google.cloud import spanner

app = Flask(__name__, static_folder='client/assets', template_folder='templates')

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\dudzi\Downloads\buckbuddiesapp-firebase-adminsdk-djci7-4e99168191.json'


# Set the environment variable for Google Application Credentials
cred = credentials.Certificate(r'C:\Users\dudzi\Downloads\buckbuddiesapp-firebase-adminsdk-djci7-4e99168191.json')
firebase_admin.initialize_app(cred)

# Initialize Spanner client
spanner_client = spanner.Client()
instance_id = 'newdatabase'
database_id = 'newdb'
instance = spanner_client.instance(instance_id)
database = instance.database(database_id)


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
    return render_template('/bank.html')

@app.route('/authentication/sign-up.html')
def sign_up_page():
    return render_template('/authentication/sign-up.html')

@app.route('/authentication/sign-in.html')
def sign_in_page():
    return render_template('/authentication/layouts/corporate/sign-in.html')

@app.route('/authentication/new-password.html')
def new_password_page():
    return render_template('/authentication/layouts/corporate/new-password.html')

@app.route('/authentication/reset-password.html')
def reset_password_page():
    return render_template('/authentication/layouts/corporate/reset-password.html')


# def show_data():
#     # Get the data from Spanner
#     data = get_spanner_data()
    
#     # Convert the data to an HTML table
#     html = "<table border='1'><tr><th>Transaction ID</th><th>Account ID</th><th>Amount</th><th>Description</th></tr>"
#     for row in data:
#         html += "<tr>"
#         for cell in row:
#             html += f"<td>{cell}</td>"
#         html += "</tr>"
#     html += "</table>"

#     return html

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
