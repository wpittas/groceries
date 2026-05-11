const sharedBackend = "https://crudcrud.com/api/YOUR_API_KEY/grocery-items"; // Replace YOUR_API_KEY with actual key

const sharedInput = document.getElementById("sharedInput");
const sharedAddButton = document.getElementById("sharedAddButton");
const sharedList = document.getElementById("sharedList");
const refreshSharedButton = document.getElementById("refreshSharedButton");

let sharedDocId = null;
let sharedItems = [];

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
  sharedList.innerHTML = "";
  if (sharedItems.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No items yet. Add the first one!";
    emptyMessage.className = "empty-message";
    sharedList.appendChild(emptyMessage);
    return;
  }

  sharedItems.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className = "grocery-item";

    const label = document.createElement("span");
    label.textContent = item;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "remove-btn";
    removeButton.addEventListener("click", async () => {
      sharedItems.splice(index, 1);
      renderShared();
      await saveSharedItems();
      console.log("Removed shared item at index", index);
    });

    listItem.append(label, removeButton);
    sharedList.appendChild(listItem);
  });
  console.log("Shared list rendered with", sharedItems.length, "items");
}

async function loadShared() {
  await fetchSharedDoc();
  renderShared();
}

function addSharedItem() {
  const text = sharedInput.value.trim();
  console.log("Adding shared item:", text);
  if (!text) return;

  sharedItems.unshift(text);
  sharedInput.value = "";
  renderShared();
  saveSharedItems();
}

// Event listeners
sharedAddButton.addEventListener("click", addSharedItem);
sharedInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addSharedItem();
});

refreshSharedButton.addEventListener("click", async () => {
  refreshSharedButton.textContent = "Loading...";
  await loadShared();
  refreshSharedButton.textContent = "Refresh";
});

// Initialize
loadShared();
