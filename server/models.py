# models.py
from extensions import db, login_manager, bcrypt
from flask_login import UserMixin

# User class represents a user and their attributes
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=True)
    google_id = db.Column(db.String(120), unique=True, nullable=True)
    
    def check_password(self, password):
        if self.password is None:
            return False
        return bcrypt.check_password_hash(self.password, password)

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Image db
class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash_id = db.Column(db.String(255))
    local_name = db.Column(db.String(255))
    auto_classification = db.Column(db.String(255))
    fraction_correct = db.Column(db.Integer)
    fraction_total = db.Column(db.Integer)
    image_labels = db.relationship('ImageLabel', backref='image')

    def to_dict(self):
        return {
            'id': self.id,
            'hash_id': self.hash_id,
            'local_name': self.local_name,
            'auto_classification': self.auto_classification,
            'fraction_correct': self.fraction_correct,
            'fraction_total': self.fraction_total,
            'image_labels': [label.to_dict() for label in self.image_labels]
        }

# Label db
class Label(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    image_labels = db.relationship('ImageLabel', backref='label')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'image_labels': [label.to_dict() for label in self.image_labels]
        }

# Label Image
class ImageLabel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    segmentation_data = db.Column(db.JSON)
    image_id = db.Column(db.Integer, db.ForeignKey('image.id'))
    label_id = db.Column(db.Integer, db.ForeignKey('label.id'))
    count = db.Column(db.Integer)

    def to_dict(self):
        return {
            'id': self.id,
            'segmentation_data': self.segmentation_data,
            'image_id': self.image_id,
            'label_id': self.label_id,
            'count': self.count
        }