from flask import Flask, request, redirect, jsonify
import requests

app = Flask(__name__)

# Replace with your actual values
CLIENT_ID = "862421413145-j1g53d2d89o75c2ng9o9u9joipm4ls0v.apps.googleusercontent.com"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"  # Keep this secret!
REDIRECT_URI = "http://localhost:5500/auth/callback"

@app.route('/')
def home():
    return 'Welcome to Google OAuth! <a href="/login">Login with Google</a>'

@app.route('/login')
def login():
    auth_url = (
        "https://accounts.google.com/o/oauth2/auth?"
        f"client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&response_type=code"
        "&scope=https://www.googleapis.com/auth/fitness.activity.read"
    )
    return redirect(auth_url)

@app.route('/auth/callback')
def auth_callback():
    # Get authorization code from Google
    code = request.args.get("code")
    if not code:
        return "Error: No authorization code received", 400

    # Exchange authorization code for access token
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    response = requests.post(token_url, data=data)
    token_info = response.json()

    if "access_token" in token_info:
        return jsonify(token_info)  # Return the token info as JSON
    else:
        return jsonify({"error": "Failed to fetch access token", "details": token_info}), 400

if __name__ == '__main__':
    app.run(port=5500, debug=True)
