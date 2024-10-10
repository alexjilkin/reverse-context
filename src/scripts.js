document.getElementById("submitBtn").addEventListener("click", submitGuess);
document.getElementById("theForm").addEventListener("submit", submitGuess);

let results = [];

// const url = "http://localhost:5000/guess";
const url = "http://10.5.3.75:8000/guess";

async function submitGuess(e) {
  e.preventDefault();
  const word = document.getElementById("wordInput").value;
  const feedback = document.getElementById("feedback");
  const resultList = document.getElementById("resultList");

  document.getElementById("wordInput").value = "";
  feedback.textContent = "";

  if (!word) {
    feedback.textContent = "Enter a word.";
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    });

    if (response.status === 400) {
      feedback.textContent = "Not a valid word.";
      return;
    }

    const data = await response.json();
    const similarityScore = data.similarity;

    results.push({ word, similarity: parseInt(similarityScore) });
    results.sort((a, b) => a.similarity - b.similarity);

    resultList.innerHTML = "";
    results.forEach((result, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item", "score");

      if (result.word === word) {
        listItem.classList.add("highlight");
      }

      listItem.classList.remove("lowest-score");
      listItem.textContent = `${result.word}: ${result.similarity}`;

      if (index === 0) {
        listItem.classList.add("lowest-score");
        if (results.length > 2) {
          const shareButton = document.createElement("button");
          shareButton.classList.add("btn", "btn-sm", "btn-success", "ms-2");
          shareButton.textContent = "Share";
          shareButton.onclick = () => copyToClipboard(result.similarity, result.word);
          listItem.appendChild(shareButton);
        }
      }

      resultList.appendChild(listItem);
    });

    setTimeout(() => {
      const lastItem = document.querySelector(".highlight");
      if (lastItem) {
        lastItem.classList.remove("highlight");
      }
    }, 2000);
  } catch (error) {
    feedback.textContent = "Error occurred.";
  }
}
function copyToClipboard(similarity, word) {
  const shareText = `I scored as low as ${similarity} with *${word}* 🎯!`;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        showClipboardMessage(`Copied to clipboard: ${shareText}`);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        showClipboardMessage("Failed to copy to clipboard. Please try again.");
      });
  } else {
    // Fallback for non-secure context (HTTP) environments
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showClipboardMessage(`Copied to clipboard: ${shareText}`);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      showClipboardMessage("Failed to copy to clipboard. Please try again.");
    }
    document.body.removeChild(textarea);
  }
}

function showClipboardMessage(message) {
  const clipboardMessage = document.getElementById("clipboardMessage");
  clipboardMessage.textContent = message;
  clipboardMessage.style.display = "block";

  setTimeout(() => {
    clipboardMessage.style.display = "none";
  }, 6000);
}
