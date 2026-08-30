from PIL import Image
img = Image.open('C:/Users/semsh/.gemini/antigravity/brain/cbe9065d-6572-41f9-a91f-2ec1f09eb936/.user_uploaded/media_1788062747939.png')
podium = img.crop((30, 330, 500, 650))
podium.save('public/login-podium.png')
