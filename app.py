import os

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.json
    user_message = data.get("message", "")

    from google.genai import types
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful AI assistant. If anyone asks who created you, developed you, or made you (in English or Tamil), you MUST reply 'I am developed by Dhanamalini' (or the equivalent in Tamil 'என்னை உருவாக்கியவர் Dhanamalini')."
        )
    )

    return jsonify({
        "reply": response.text
    })


if __name__ == "__main__":
    app.run(debug=True)