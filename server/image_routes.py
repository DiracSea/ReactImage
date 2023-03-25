from flask import Blueprint, jsonify, request, send_from_directory
from models import db, Image, Label, ImageLabel
import hashlib
import torch
from PIL import Image as PIL_IMAGE
import torchvision.transforms as transforms

import os


IMAGE_UPLOADS = 'uploaded_images'
image_routes = Blueprint("image_routes", __name__)

# upload
@image_routes.route('/api/upload', methods=['POST'])
def upload_images():
    images = request.files.getlist('image')
    hash_ids = []
    for image in images:
        result = insert(image)
        hash_ids.append(result['hash_id'])
    return jsonify({'data': hash_ids, 'result': 'success'})

# read one
@image_routes.route('/images/<string:hash_id>', methods=['GET'])
def get_image(hash_id):
    image = Image.query.get(hash_id)
    if not image:
        return jsonify({'message': 'Image not found'})
    return jsonify({image.to_dict()})

# Serve static files from 'uploaded_images' folder
@image_routes.route('/uploaded_images/<path:filename>')
def uploaded_images(filename):
    return send_from_directory('uploaded_images', filename)

# update image
@image_routes.route('/update', methods=['POST'])
def update():
    hash_id = request.form['hash_id']
    if not hash_id: 
        return jsonify({'message': 'Hash not found.'})
    label = request.form.get('label', '')
    segmentation = request.form.get('segmentation_data', '')
    auto_classification = request.form.get('auto_classification', '')
    fraction_correct = request.form.get('fraction_correct', 0)
    fraction_total = request.form.get('fraction_total', 0)

    image = Image.query.filter_by(hash_id=hash_id).first()
    if not image:
        return jsonify({'message': 'Image not found.'})

    # Update the image with the new data
    if fraction_total:
        image.fraction_correct += fraction_correct
        image.fraction_total += fraction_total
        db.session.commit()
    if auto_classification:
        image.auto_classification = auto_classification
        db.session.commit()

    # Update the image's label
    label = Label.query.filter_by(name=label).first()
    if not label:
        label = Label(name=label)
        db.session.add(label)
    create_image_label(image, label, segmentation)
    db.session.commit()

    return jsonify({'message': 'Image updated successfully.'})

# get all images
@image_routes.route('/api/images', methods=['GET'])
def get_images():
    images = Image.query.all()
    data = []
    for image in images:
        data.append({
            'id': image.id,
            'local_name': image.local_name,
            'hash_id': image.hash_id,
        })
    return jsonify({'data': data})

@image_routes.route('/api/gaussian', methods=['POST'])
def add_gaussian_noise_route():
    if 'hash_id' not in request.files:
        return jsonify({'result': 'fail'})
    id = request.files['hash_id']
    image = PIL_IMAGE.open(f"{IMAGE_UPLOADS}/{id}.png")
    noisy_image = add_gaussian_noise(image)
    new_id = get_image_id(noisy_image)
    noisy_image.save(f"{IMAGE_UPLOADS}/{new_id}.png", format='PNG')
    new_image = Image(hash_id=new_id, local_name=new_id, 
                    fraction_correct=0, fraction_total=0)
    # Add the new_image to the database and commit the changes
    db.session.add(new_image)
    db.session.commit()
    return jsonify(new_image)


def insert(file):
    if not file:
        return {'success': False, 'message': 'No file uploaded'}
    # get label
    local_name = file.filename
    # Generate unique hash_id for image
    hash_id = get_image_id(file.read())
    image = Image.query.filter_by(hash_id=hash_id).first()
    
    if image is not None:
        return {'success': True, 'hash_id': hash_id}
    file.seek(0)  # Reset file pointer after reading
    file_data = file.read()
    create_upload_directory(IMAGE_UPLOADS)
    with open(f"{IMAGE_UPLOADS}/{hash_id}.png", "wb") as f:
        f.write(file_data)
    image = Image(hash_id=hash_id, local_name=local_name, 
                    fraction_correct=0, fraction_total=0)

    # Add image to database
    db.session.add(image)
    db.session.commit()

    return {'success': True, 'hash_id': hash_id}

def create_image_label(image, label, segmentation):
    # Check if the label already exists for this image
    image_label = ImageLabel.query.filter_by(image=image, label=label).first()

    if image_label is None:
        # Create a new ImageLabel instance with count=1 and the provided segmentation
        image_label = ImageLabel(image=image, label=label, count=1, segmentation_data=[segmentation])
    else:
        # Append the provided segmentation and increment the count attribute
        image_label.segmentation_data.append(segmentation)
        image_label.count += 1

    db.session.add(image_label)
    db.session.commit()

    return image_label

def get_image_id(data):
    md5_hash = hashlib.md5(data).hexdigest()
    return md5_hash

def add_gaussian_noise(image, mean=0, std=0.1):
    image_tensor = transforms.ToTensor()(image).unsqueeze(0)
    noise = torch.randn(image_tensor.size()) * std + mean
    noisy_image_tensor = image_tensor + noise
    noisy_image = transforms.ToPILImage()(noisy_image_tensor.squeeze())
    return noisy_image

def create_upload_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)