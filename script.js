const storageKey = "grocery-buddy-items";
const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");
const shareButton = document.getElementById("shareButton");
const groceryList = document.getElementById("groceryList");
const emptyMessage = document.getElementById("emptyMessage");

let items = JSON.parse(localStorage.getItem(storageKey) || "[]");

function saveItems() {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function loadSharedItems() {
  if (!window.location.hash) return false;

  try {
    const payload = decodeURIComponent(window.location.hash.slice(1));
    const sharedItems = JSON.parse(payload);
    if (Array.isArray(sharedItems) && sharedItems.every((item) => typeof item === "string")) {
      items = sharedItems;
      saveItems();
      return true;
    }
  } catch (error) {
    console.warn("Could not load shared list:", error);
  }

  return false;
}

function getShareUrl() {
  const payload = encodeURIComponent(JSON.stringify(items));
  return `${location.origin}${location.pathname}#${payload}`;
}

function renderItems() {
  groceryList.innerHTML = "";

  if (items.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  items.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className = "grocery-item";

    const label = document.createElement("span");
    label.textContent = item;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      items.splice(index, 1);
      saveItems();
      renderItems();
    });

    listItem.append(label, removeButton);
    groceryList.appendChild(listItem);
  });
}

function addItem() {
  const text = itemInput.value.trim();
  if (!text) return;

  items.unshift(text);
  itemInput.value = "";
  saveItems();
  renderItems();
  itemInput.focus();
}

addButton.addEventListener("click", addItem);
itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addItem();
});

shareButton.addEventListener("click", async () => {
  if (!items.length) {
    alert("Add items first before sharing your list.");
    return;
  }

  const url = getShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard. Send it to your partner.");
  } catch (error) {
    prompt("Copy this share link manually:", url);
  }
});

clearButton.addEventListener("click", () => {
  if (!items.length) return;
  if (confirm("Clear your entire grocery list?")) {
    items = [];
    saveItems();
    renderItems();
  }
});

loadSharedItems();
renderItems();
