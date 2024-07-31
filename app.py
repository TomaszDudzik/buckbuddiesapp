import os
import yaml
from flask import Flask, render_template
# from google.cloud import spanner

app = Flask(__name__, static_folder='assets')

# # Initialize the Spanner client
# spanner_client = spanner.Client()

# # Your GCP project ID and Spanner instance/database IDs
# project_id = 'buckbuddiesapp'
# instance_id = 'buckbuddiesapp'
# database_id = 'test_db'

# # Get a reference to the Spanner instance and database
# instance = spanner_client.instance(instance_id)
# database = instance.database(database_id)

# def get_spanner_data():
#     query = 'SELECT transaction_id, account_id, amount, description FROM transactions LIMIT 3'
#     rows = []
#     with database.snapshot() as snapshot:
#         results = snapshot.execute_sql(query)
#         for row in results:
#             rows.append(row)
#     return rows

@app.route('/')
def cockpit():
    with open('config.yaml') as config_file:
        config = yaml.safe_load(config_file)
    return render_template('cockpit.html', config=config)

@app.route('/bank.html')
def bank():
    return render_template('/bank.html')

@app.route('/authentication/sign-up.html')
def sign_up_page():
    return render_template('/authentication/layouts/corporate/sign-up.html')

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
