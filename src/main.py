from nltk.corpus import words
from flask import Flask, request, jsonify
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from flask_cors import CORS

import nltk

nltk.download("words")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Load the NLTK word list
valid_words = set(words.words())  # Set for faster lookup

# Load pre-trained BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertModel.from_pretrained("bert-base-uncased")


# Function to compute similarity
def get_word_embedding(word):
    inputs = tokenizer(word, return_tensors="pt")
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy()


def cosine_similarity(vec1, vec2):
    vec1 = vec1.flatten()
    vec2 = vec2.flatten()
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2)


target_word = "keyboard"
target_embedding = get_word_embedding(target_word)


@app.route("/guess", methods=["POST"])
def guess_word():
    guessed_word = request.json.get("word")

    # Check if the guessed word is valid
    if guessed_word.lower() not in valid_words:
        return jsonify({"error": "Invalid word"}), 400

    guessed_embedding = get_word_embedding(guessed_word)
    similarity = cosine_similarity(target_embedding, guessed_embedding)

    return jsonify({"word": guessed_word, "similarity": float(similarity)})


if __name__ == "__main__":
    app.run()
