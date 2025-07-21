import os
from flask import Flask, redirect, abort, redirect, send_from_directory

ALLOWED_EXTENSIONS = {'html', 'js', 'css', 'png', 'ico', 'json'}

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

    @app.route('/<path:path>', methods=['GET'])
    def web(path):
        if allowed_file(path):
            return send_from_directory('navitia-explorer', secured_file(path))
        else: 
        #    return 'bad request!', 400
            abort(404)

    return app