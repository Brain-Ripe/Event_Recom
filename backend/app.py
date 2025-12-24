from flask import Flask
from config import Config
from flask_cors import CORS
from models import db
from routes import api

app = Flask(__name__)
app.config.from_object(Config)

# 👇 THIS IS THE IMPORTANT PART
CORS(app)

db.init_app(app)
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True)
