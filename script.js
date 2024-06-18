document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const autocompleteResults = document.getElementById("autocomplete-results");
  const historyList = document.getElementById("history-list");
  const clearBtn = document.getElementById("clear-btn");
  const debounceTimeout = 700;
  var debounceTimer;

  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.innerText = input;
    return div.innerHTML;
  }

  async function fetchTitles(query) {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${query}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log(data);
      if (data.totalItems === 0) {
        return [];
      }
      return data.items.slice(0, 10).map((doc) => doc.volumeInfo.title);
    } catch (error) {
      console.error("Fetch error: ", error);
      return [];
    }
  }

  function renderAutocompleteResults(titles) {
    autocompleteResults.innerHTML = "";
    titles.forEach((title) => {
      const div = document.createElement("div");
      div.classList.add("autocomplete-result");
      const query = searchInput.value.trim();
      const regex = new RegExp(`(${query})`, "gi");
      const boldedTitle = title.replace(regex, "<b>$1</b>");
      div.innerHTML = boldedTitle;
      div.onclick = () => selectTitle(title);
      autocompleteResults.appendChild(div);
    });
  }

  function selectTitle(title) {
    const timestamp = new Date().toLocaleString();
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.innerText = `${title} (${timestamp})`;
    li.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => li.remove();
    li.appendChild(deleteBtn);

    historyList.appendChild(li);
    autocompleteResults.innerHTML = "";
    searchInput.value = "";
  }

  function clearSearchHistory() {
    historyList.innerHTML = "";
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = sanitizeInput(searchInput.value.trim());
    if (query) {
      debounceTimer = setTimeout(async () => {
        console.log("search");
        const titles = await fetchTitles(query);
        renderAutocompleteResults(titles);
      }, debounceTimeout);
    } else {
      autocompleteResults.innerHTML = "";
    }
  });

  clearBtn.addEventListener("click", clearSearchHistory);

  function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history.forEach((item) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.innerText = item;
      li.appendChild(span);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => {
        li.remove();
        saveSearchHistory();
      };
      li.appendChild(deleteBtn);
      historyList.appendChild(li);
    });
  }

  function saveSearchHistory() {
    const history = Array.from(historyList.children).map((li) => li.firstChild.textContent);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  loadSearchHistory();
});
