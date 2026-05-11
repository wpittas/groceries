# Pittas Grocery Buddy

A simple Android-friendly grocery list app built as a GitHub Pages site.

## How to host

1. Create a GitHub repository named `groceroies` or another name of your choice.
2. In this folder, add the repository remote and push the files:

```bash
git remote add origin https://github.com/<your-username>/groceroies.git
git branch -M main
git push -u origin main
```

3. In the repository settings, enable GitHub Pages from the `main` branch and use the root directory.
4. Visit the published URL, for example `https://<your-username>.github.io/groceroies/`.

## Usage

- Open the page on your Android phone.
- Add grocery items and remove them as needed.
- Use the "Share link" button to copy a shareable URL and send it to your partner.
- Items in the top list are stored locally in the browser using `localStorage`.
- The bottom shared list is synced across visitors using a backend service.
- Use "Add to Home screen" from the browser menu to install it as a PWA-like app.

## Files

- `index.html`: app markup
- `styles.css`: page styles
- `script.js`: list logic and storage
