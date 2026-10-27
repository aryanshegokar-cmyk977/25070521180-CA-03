// Makes text safe to use inside a search pattern (so "?" or "(" don't break the search).
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "The Adventures of Sherlock Holmes!" -> "the-adventures-of-sherlock-holmes"
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { escapeRegex, slugify };
