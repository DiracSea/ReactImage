import torch
import torchvision.transforms as transforms

import io

def add_gaussian_noise(image, mean=0, std=0.1):
    image_tensor = transforms.ToTensor()(image).unsqueeze(0)
    noise = torch.randn(image_tensor.size()) * std + mean
    noisy_image_tensor = image_tensor + noise
    noisy_image = transforms.ToPILImage()(noisy_image_tensor.squeeze())
    return noisy_image

def noisy_image_bytes(image):
    noisy_image = add_gaussian_noise(image)
    img_byte_array = io.BytesIO()
    noisy_image.save(img_byte_array, format='PNG')
    img_byte_array = img_byte_array.getvalue()
    return img_byte_array
