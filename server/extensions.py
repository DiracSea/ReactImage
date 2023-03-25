from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_oauthlib.client import OAuth

bcrypt = Bcrypt()
oauth = OAuth()
db = SQLAlchemy()
login_manager = LoginManager()
