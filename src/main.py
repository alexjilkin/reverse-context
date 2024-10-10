from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader as api
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

word2vec_model = api.load("glove-wiki-gigaword-300")  # GloVe model with 300d embeddings


def get_word_embedding(word):
    try:
        return word2vec_model.get_vector(word)
    except KeyError:
        return None


def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    similarity = dot_product / (norm1 * norm2)

    similarity_normalized = (similarity + 1) / 2
    return round(similarity_normalized * 100)


target_word = "sun"
target_embedding = get_word_embedding(target_word)


@app.route("/guess", methods=["POST"])
def guess_word():
    guessed_word = request.json.get("word").lower()
    guessed_embedding = get_word_embedding(guessed_word)

    if guessed_embedding is None:
        return jsonify({"error": "Word not found in vocabulary"}), 400

    similarity = cosine_similarity(target_embedding, guessed_embedding)

    return jsonify(
        {
            "word": guessed_word,
            "similarity": float(similarity),
        }
    )


@app.route("/")
def index():
    return "Hello Game!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
