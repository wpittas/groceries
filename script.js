const storageKey = "grocery-buddy-items";
const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");
const shareButton = document.getElementById("shareButton");
const groceryList = document.getElementById("groceryList");
const emptyMessage = document.getElementById("emptyMessage");
const listCount = document.getElementById("listCount");
const suggestionChips = document.querySelectorAll(".suggestion-chip");

const sharedInput = document.getElementById("sharedInput");
const sharedAddButton = document.getElementById("sharedAddButton");
const sharedList = document.getElementById("sharedList");
const refreshSharedButton = document.getElementById("refreshSharedButton");
let sharedDocId = null;
let sharedItems = [];

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

async function fetchSharedDoc() {
  try {
    console.log("Fetching shared list...");
    const response = await fetch(sharedBackend);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const results = await response.json();
    console.log("Shared data:", results);
    if (results.length > 0) {
      sharedDocId = results[0]._id;
      sharedItems = Array.isArray(results[0].items) ? results[0].items : [];
    } else {
      console.log("No shared doc, creating new one...");
      const createResponse = await fetch(sharedBackend, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      });
      if (!createResponse.ok) throw new Error("Could not create shared list");
      const created = await createResponse.json();
      sharedDocId = created._id;
      sharedItems = [];
      console.log("Created shared doc:", sharedDocId);
    }
  } catch (error) {
    console.error("Shared list error:", error);
    sharedItems = [];
    alert("Shared list is temporarily unavailable. Try refreshing the page.");
  }
}

async function saveSharedItems() {
  if (!sharedDocId) {
    console.warn("No shared doc ID, skipping save");
    return;
  }

  try {
    console.log("Saving shared items:", sharedItems);
    const response = await fetch(`${sharedBackend}/${sharedDocId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: sharedItems }),
    });

    if (!response.ok) throw new Error(`Save failed: ${response.status}`);
    console.log("Shared items saved successfully");
  } catch (error) {
    console.error("Shared update failed:", error);
    alert("Shared list update failed. Try again in a moment.");
  }
}

function renderShared() {
  if (!sharedList || !sharedEmptyMessage) return;

  sharedList.innerHTML = "";
  if (sharedItems.length === 0) {
    sharedEmptyMessage.style.display = "block";
    return;
  }

  sharedEmptyMessage.style.display = "none";

  sharedItems.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className = "grocery-item";

    const label = document.createElement("span");
    label.textContent = item;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", async () => {
      sharedItems.splice(index, 1);
      renderShared();
      await saveSharedItems();
      console.log("Removed shared item at index", index);
    });

    listItem.append(label, removeButton);
    sharedList.appendChild(listItem);
  });
  console.log("Shared list loaded with", sharedItems.length, "items");
}

async function loadShared() {
  await fetchSharedDoc();
  renderShared();
}

function addSharedItem() {
  const text = sharedInput.value.trim();
  console.log("Added shared item:", text);
  if (!text) return;

  sharedItems.unshift(text);
  sharedInput.value = "";
  renderShared();
  saveSharedItems();
}

function refreshSummary() {
  if (!listCount) return;
  listCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
}

function renderItems() {
  groceryList.innerHTML = "";

  refreshSummary();

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

function addItem(preloadedText) {
  const text = (preloadedText || itemInput.value).trim();
  if (!text) return;

  items.unshift(text);
  itemInput.value = "";
  saveItems();
  renderItems();
  itemInput.focus();
}

addButton.addEventListener("click", () => addItem());
itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addItem();
});

if (sharedAddButton) {
  sharedAddButton.addEventListener("click", addSharedItem);
}

if (refreshSharedButton) {
  refreshSharedButton.addEventListener("click", async () => {
    refreshSharedButton.textContent = "Loading...";
    await loadShared();
    refreshSharedButton.textContent = "Refresh";
  });
}

suggestionChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    addItem(chip.dataset.item);
  });
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
loadShared();
