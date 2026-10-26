
const searchForm = document.getElementById("search-form");
const wordInput = document.getElementById("word-input");
const message = document.getElementById("message");
const results = document.getElementById("results");
const wordTitle = document.getElementById("word-title");
const pronunciation = document.getElementById("pronunciation");
const definitions = document.getElementById("definitions");
const favoriteButton = document.getElementById("favorite-button");
const favoritesList = document.getElementById("favorites-list");
const themeButton = document.getElementById("theme-button");

results.hidden = true;

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const word = wordInput.value.trim();

  if (!word) {
    message.textContent = "Please enter a word to search.";
    return;
  }

  message.textContent = "Searching...";
  results.hidden = true;
  wordTitle.textContent = "";
  pronunciation.textContent = "";
  definitions.replaceChildren();

  try {
    const response = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
    );

    if (response.status === 404) {
      throw new Error("Word not found. Try another word.");
    }

    if (!response.ok) {
      throw new Error("Dictionary service unavailable. Try again.");
    }

    const data = await response.json();
     const entries = data.en;
    if (!entries || entries.length === 0) {
      throw new Error("No English definitions found for this word.");
    }

    displayWord(word, entries);
favoriteButton.hidden = false;
message.textContent = "";
results.hidden = false;
  } catch (error) {
    message.textContent =
      error instanceof TypeError
        ? "Unable to connect. Check your internet and try again."
        : error.message;
  }
});

function displayWord(word, entries) {
  wordTitle.textContent = word;
  pronunciation.textContent = "Pronunciation audio may not be available.";

  entries.forEach((entry) => {
    const section = document.createElement("section");
    section.className = "definition";

    const partOfSpeech = document.createElement("h3");
    partOfSpeech.className = "part-of-speech";
    partOfSpeech.textContent = entry.partOfSpeech;

    section.appendChild(partOfSpeech);

    entry.definitions.forEach((item, index) => {
      const definitionText = document.createElement("p");

      
      const temporaryElement = document.createElement("div");
      temporaryElement.innerHTML = item.definition;

temporaryElement.querySelectorAll("style, link").forEach((element) => {
  element.remove();
});

definitionText.textContent =
  `${index + 1}. ${temporaryElement.textContent.trim()}`;
      section.appendChild(definitionText);

      const exampleText =
        item.parsedExamples?.[0]?.example || item.examples?.[0];

      if (exampleText) {
        const example = document.createElement("p");
        example.className = "example";

        const temporaryExample = document.createElement("div");
        temporaryExample.innerHTML = exampleText;

        example.textContent = `Example: "${temporaryExample.textContent}"`;
        section.appendChild(example);
      }
    });

    definitions.appendChild(section);
  });
}

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function displayFavorites() {
  favoritesList.replaceChildren();

  favorites.forEach((word) => {
    const item = document.createElement("li");
    const wordButton = document.createElement("button");

    wordButton.textContent = word;
    wordButton.type = "button";

    wordButton.addEventListener("click", () => {
      wordInput.value = word;
      searchForm.requestSubmit();
    });

    item.appendChild(wordButton);

const removeButton = document.createElement("button");
removeButton.textContent = "Remove";
removeButton.type = "button";

removeButton.addEventListener("click", () => {
  favorites = favorites.filter((favorite) => favorite !== word);

  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
});

item.appendChild(removeButton);
favoritesList.appendChild(item);
  });
}

favoriteButton.addEventListener("click", () => {
  const word = wordTitle.textContent;

  if (!favorites.includes(word)) {
    favorites.push(word);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
    favoriteButton.textContent = "♥ Added to favorites";
  } else {
    message.textContent = "This word is already in your favorites.";
  }
});

displayFavorites();

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    themeButton.textContent = "☀️ Light mode";
  } else {
    themeButton.textContent = "🌙 Dark mode";
  }
});
