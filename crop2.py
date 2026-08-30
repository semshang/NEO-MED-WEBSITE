from PIL import Image
img = Image.open('C:/Users/semsh/.gemini/antigravity/brain/cbe9065d-6572-41f9-a91f-2ec1f09eb936/.user_uploaded/media_1788062747939.png')
# left panel is approx x=28 to 512
# y=28 to 654
left_panel = img.crop((28, 28, 512, 654))
left_panel.save('public/login-left-panel.png')

# just the podium: x=28 to 512, y=360 to 654
podium = img.crop((28, 350, 512, 654))
podium.save('public/login-podium-only.png')
