document.getElementById("submitBtn").addEventListener("click", submitGuess);
document.getElementById("theForm").addEventListener("submit", submitGuess);

let results = [];

// const url = "http://localhost:5000/guess";
const url = "http://107.20.175.218:8000/guess";

async function submitGuess(e) {
  e.preventDefault();
  const word = document.getElementById("wordInput").value;
  const feedback = document.getElementById("feedback");
  const resultList = document.getElementById("resultList");

  document.getElementById("wordInput").value = '';
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
    const similarityScore = data.similarity.toFixed(2);

    results.push({ word, similarity: parseFloat(similarityScore) });
    results.sort((a, b) => a.similarity - b.similarity);

    resultList.innerHTML = "";
    results.forEach((result, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item", "score");

      if (result.word === word) {
        listItem.classList.add("highlight");
      }

      listItem.classList.remove("lowest-score");
      listItem.textContent = `${result.word}: ${result.similarity.toFixed(2)}`;

      if (index === 0) {
        listItem.classList.add("lowest-score");
        if (results.length > 2) {
          const shareButton = document.createElement("button");
          shareButton.classList.add("btn", "btn-sm", "btn-success", "ms-2");
          shareButton.textContent = "Share";
          shareButton.onclick = () => copyToClipboard(result.similarity);
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

function copyToClipboard(similarity) {
    const shareText = `I got a word with ${similarity} context!`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      const clipboardMessage = document.getElementById("clipboardMessage");
      clipboardMessage.textContent = "Copied to clipboard: " + shareText;
      clipboardMessage.style.display = "block";
  
      setTimeout(() => {
        clipboardMessage.style.display = "none";
      }, 3000);
  
    }).catch((err) => {
      console.error("Could not copy text: ", err);
    });
  }
  
