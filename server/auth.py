# auth.py
from flask import Blueprint, url_for, request, jsonify, Response
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db, bcrypt, oauth
from models import User

auth_blueprint = Blueprint('auth', __name__)

# Google OAuth configuration
google = oauth.remote_app(
    'google',
    consumer_key='445683337281-jcq3e4mta58mmvag7t2mimdtkq5tsjag.apps.googleusercontent.com',
    consumer_secret='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',
    request_token_params={
        'scope': 'email'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

# Login endpoint - authenticate user using email and password
@auth_blueprint.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({"result": "success", "message": "Logged in successfully"})
    else:
        return jsonify({"result": "error", "message": "Invalid email or password"})
    
# Register endpoint - create a new account with provided user information
@auth_blueprint.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    existing_user = User.query.filter_by(email=data['username']).first()
    if existing_user:
        return jsonify({"result": "error", "message": "Username already exists"}), 400
    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        return jsonify({"result": "error", "message": "Email already exists"}), 400

    if 'google_id' in data:  
        # Google OAuth registration
        user = User(username=data['username'], email=data['email'], google_id=data['google_id'], password=None)
    else:  
        # Regular registration
        if not data or 'password' not in data or not data['password']:
            return jsonify({"result": "error", "message": "Password is required"}), 400
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(username=data['username'], email=data['email'], password=hashed_password or None)

    db.session.add(user)
    db.session.commit()
    return jsonify({"result": "success", "message": "Account created successfully"})

# Logout endpoint - log out the current user
@auth_blueprint.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"result": "success", "message": "Logged out successfully"})

# Google login endpoint - redirect user to Google OAuth login page
@auth_blueprint.route('/api/google_login')
def google_login():
    return google.authorize(callback=url_for('auth.google_authorized', _external=True))

# Google authorized endpoint - handle the response from Google OAuth
@auth_blueprint.route('/api/google_authorized')
def google_authorized():
    resp = google.authorized_response()

    if resp is None:
        return jsonify({"result": "error", "message": "Access denied"})
    
    access_token = resp['access_token']
    google_user_data = google.get('userinfo', token=(access_token, '')).data
    username = google_user_data.get('name', None)
    if username is None:
        username = google_user_data['email']
    email = google_user_data['email']
    google_id = google_user_data['id']
    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        user = User(username=username, email=email, google_id=google_id)
        db.session.add(user)
        db.session.commit()

    login_user(user)
    return "<script>window.opener.postMessage({result: 'success'}, '*'); window.close();</script>"

# Get the Google OAuth token for the logged-in user
@google.tokengetter
def get_google_oauth_token(): 
    return current_user.google.token
