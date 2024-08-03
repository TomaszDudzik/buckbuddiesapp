import os
import yaml
from flask import Flask, render_template, request, jsonify
from firebase_admin import auth as firebase_auth
from server.spanner import database
from server.firebase_init import cred 

app = Flask(__name__, static_folder='client/assets', template_folder='templates')

#Middleware to verify Firebase ID token
def authenticate_token(f):
    def wrap(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            print("Authorization header found")
            try:
                id_token = auth_header.split('Bearer ')[1]
                print(f"ID Token extracted: {id_token}")
                decoded_token = firebase_auth.verify_id_token(id_token)
                print(f"Decoded token: {decoded_token}")
                request.user = decoded_token
                return f(*args, **kwargs)
            except IndexError:
                print("Bearer token not found in the Authorization header")
                return jsonify({'error': 'Invalid Authorization Header'}), 401
            except Exception as e:
                print(f"Error verifying ID token: {e}")
                return jsonify({'error': 'Unauthorized'}), 401
        else:
            print("Authorization header missing")
            return jsonify({'error': 'Missing Authorization Header'}), 401
    return wrap

# Endpoint to store user information
@app.route('/storeUserInfo', methods=['POST'])
@authenticate_token
def store_user_info():
    user_info = request.json
    user_id = request.user['uid']

    with database.batch() as batch:
        try:
            batch.insert_or_update(
                table='Users',
                columns=('userId', 'displayName', 'email', 'photoURL'),
                values=[
                    (user_id, user_info['displayName'], user_info['email'], user_info['photoURL'])
                ]
            )
            return jsonify({'status': 'User information stored successfully.'}), 200
        except Exception as e:
            return jsonify({'error': 'Error storing user information.'}), 500


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
