# app.py
from flask import Flask, request
from flask_cors import CORS
from extensions import bcrypt, oauth, db, login_manager
import os

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing
CORS(app, supports_credentials=True)
# Configure the app, db, and login_manager instances
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

bcrypt.init_app(app)
oauth.init_app(app)
db.init_app(app)
login_manager.init_app(app)

# register blueprint
from auth import auth_blueprint
from image_routes import image_routes
app.register_blueprint(auth_blueprint)
app.register_blueprint(image_routes)

if __name__ == "__main__":
    # database initilize
    with app.app_context():
        db.create_all()
    app.run(debug=True)