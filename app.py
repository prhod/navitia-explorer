import os
from flask import Flask, redirect, abort, redirect, send_from_directory, request, jsonify
import requests
from urllib.parse import urlencode

ALLOWED_EXTENSIONS = {'html', 'js', 'css', 'png', 'ico', 'json', "jpeg"}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def secured_file(filename):
    return filename.replace("..", "")

def create_app(test_config=None):
    app = Flask(__name__)
    app.secret_key = ""


    @app.route('/')
    # @app.route('/index.html')
    def root():
        return redirect("/index.html", code=302)

    @app.route('/api.navitia.io/<path:path>', methods=['GET'])
    def navitia(path):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            print(auth_header)
            headers = {
                'Authorization': f'{auth_header}',
                'Accept': 'application/json'
            }
            api_url = f"https://api.navitia.io/v1/{path}"
            params_dict = request.args.to_dict(flat=False)
            query_string = urlencode(params_dict, doseq=True)
            # need to keep backets to navitia api calls
            query_string = query_string.replace('%5B', '[').replace('%5D', ']')
            api_url = f"{api_url}?{query_string}"
            print("calling " + api_url)
            response = requests.get(f"{api_url}", headers=headers)  
            # response.raise_for_status()
            data = response.json()
            return jsonify(data), response.status_code
        else:
            return "", 403


    @app.route('/<path:path>', methods=['GET'])
    def web(path):
        if allowed_file(path):
            return send_from_directory('navitia-explorer', secured_file(path))
        else: 
        #    return 'bad request!', 400
            abort(404)

    return app