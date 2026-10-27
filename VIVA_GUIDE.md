# 🎓 BookVerse: Viva Guide (plain English)

This explains how BookVerse works, so you can answer when your examiner asks "how does this part work?". No jargon without an explanation.

---

## 1. The big picture: three parts

```
 [ Browser: React website ]  ⇄  [ Express server ]  ⇄  [ MongoDB database ]
       client/                       server/               (on your laptop)
   what you see & click       the rules & security       where data is stored
```

- **Client (React):** the pages you see. It never talks to the database directly. It asks the server.
- **Server (Node.js + Express):** receives requests like "give me the books" or "buy this book", checks the rules (are you logged in? is this voucher valid?), then reads or writes the database.
- **Database (MongoDB):** stores everything as "documents" (like JSON objects) inside "collections" (like folders). You can look inside with **MongoDB Compass**.

**API** = the list of URLs the server answers, e.g. `GET /api/books`. The client and server talk using **JSON** (text that looks like `{ "title": "Frankenstein" }`).

**HTTP methods = CRUD:**

| CRUD | HTTP method | Example |
|------|-------------|---------|
| **C**reate | POST | add a voucher |
| **R**ead | GET | list books |
| **U**pdate | PUT | edit a review |
| **D**elete | DELETE | delete a book |

---

## 2. The data (models): `server/src/models/`

A **model** describes the shape of one kind of data. We use **Mongoose**, a library that adds rules (required fields, allowed values) on top of MongoDB.

| Model | Stores | Key rules |
|-------|--------|-----------|
| **User** | name, email, password, role (`user` / `admin`) | email is unique; password is **hashed** before saving |
| **Book** | title, author, summary, genre, year, cover colour, **chapters** (list of title + text) | `slug` (short name) is unique |
| **Voucher** | code, max uses, used count, expiry date, who used it | code is unique and saved in CAPITALS |
| **Purchase** | which user owns which book + tag (To Read / Reading / Finished) | a user can own a book only once |
| **Review** | user, book, stars (1-5), comment | one review per user per book |

**Relationships:** Purchase and Review hold the *id* of a User and a Book. That's how they're linked (like a foreign key in SQL). `populate()` swaps the id for the real data when we need it, e.g. to show the reviewer's name.

---

## 3. Login & security

### Registration (`POST /api/auth/register`)
1. The server checks name, email and password are filled in, and that the email isn't already used.
2. The password is **hashed with bcrypt**: turned into scrambled text that can't be turned back. Even if someone steals the database, they can't read the passwords.
3. New accounts are always role `user`. Nobody can sign themselves up as admin; the admin is created by the seed script.

### Login (`POST /api/auth/login`)
1. Find the user by email.
2. `bcrypt.compare` checks the typed password against the stored hash.
3. If they match, the server creates a **JWT token**. That's a signed "pass" containing the user's id and role, valid for 7 days.
4. The client saves the token in the browser (`localStorage`) and sends it with every request in a header: `Authorization: Bearer <token>`.

### Why the token can be trusted
It's **signed** with `JWT_SECRET`, a secret only the server knows (kept in `.env`). If anyone changes the token, the signature check fails and the server rejects it.

### Guards (middleware): `server/src/middleware/auth.js`
**Middleware** = code that runs *before* a route, like a security guard at a door.
- `protect`: no valid token → **401 "Please log in first"**.
- `adminOnly`: logged in but not admin → **403 "Admins only"**.

### Guard on the website: `client/src/components/ProtectedRoute.jsx`
If nobody is logged in, every page redirects to `/login`. The Admin page also checks `role === 'admin'`.
**But the real security is on the server.** The website guard is only for convenience; the server checks the token on every request anyway.

---

## 4. Chapter locking (`GET /api/books/:id/chapters/:n`)

- The book list and details **never include chapter text**, only titles. That keeps them fast and secure.
- When you open a chapter, the server checks:
  **chapter 1** (free preview) **OR** you **own** the book (a Purchase exists) **OR** you're **admin**.
- If none apply, it replies **403 locked** and **doesn't send the text at all**. Hiding the text with CSS on the page wouldn't be secure; anyone could peek using browser tools.

---

## 5. Buying with a voucher (`POST /api/library/buy`): the star feature

The checks happen in this order, each with a friendly message:

1. **Already own the book?** → "You already own this book." The voucher is **not** used up.
2. **Code exists?** → "not a valid voucher code"
3. **Expired?** (`expiresAt` is in the past) → "expired on 1 January 2025"
4. **Used up?** (`usedCount >= maxUses`) → "fully used up"
5. **This person used it before?** (their id is in `usedBy`) → "Each code works once per person"

Then, in **one single database step** (`findOneAndUpdate`), it adds 1 to `usedCount` and adds the user to `usedBy`, but *only if* the limits still allow it. That way, if two people click Buy at the same moment for the last use, only one gets it. (This is called avoiding a **race condition**.)

Finally a **Purchase** is created, and the book appears in My Library. If saving the purchase fails, the voucher use is given back.

---

## 6. Whole books → chapters (`server/src/utils/splitBook.js`)

1. Cut off the Project Gutenberg licence text at the top and bottom (between the `*** START` and `*** END` markers).
2. Find chapter headings with a **regular expression** (a text pattern), e.g. a line starting with "Chapter" or "Letter" plus a number (`1`, `2`... or `I`, `II`...).
3. The text between two headings becomes one chapter.
4. Gutenberg files break lines every ~70 characters, so lines are re-joined into proper paragraphs. Indented blocks (poems) keep their line breaks.
5. If no headings are found → split into equal "Parts" so it never breaks.

Sherlock Holmes uses "ADVENTURE I. A SCANDAL IN BOHEMIA" instead of "Chapter", so it has its own pattern in `books.json`.

The **seed script** (`npm run seed`) saves books using `slug` as the key (an **upsert** = update if it exists, insert if not). So re-seeding updates a book *in place* and existing purchases and reviews keep pointing at it.

---

## 7. The React side: `client/src/`

| File | Job |
|------|-----|
| `main.jsx` | Starting point. Wraps the app in the **Router** (page navigation) and **AuthProvider** (login memory). |
| `App.jsx` | The list of pages and their URLs (**React Router**). Protected pages sit inside `<ProtectedRoute>`. |
| `api.js` | One **axios** helper that adds the token to every request, and logs you out if the token expires. |
| `context/AuthContext.jsx` | Shares "who is logged in" with every page (React **Context**). |
| `pages/*.jsx` | The 7 pages. |
| `components/*.jsx` | Reusable pieces: `BookCover` (draws covers from a colour, no images), `StarRating`, `BuyBox`, `Reviews`, `Navbar`, admin forms. |
| `index.css` | All the styling. **Media queries** (`@media (max-width: ...)`) change the layout on small screens, e.g. the navbar turns into a ☰ menu. |

**React basics you might be asked:**
- **Component:** a function that returns what to show (JSX, which looks like HTML).
- **State (`useState`):** data that, when changed, makes the page update automatically, e.g. the voucher code being typed.
- **Effect (`useEffect`):** code that runs after the page shows, e.g. loading books from the server.
- **Props:** values passed into a component, e.g. `<BookCover book={book} />`.

**Vite proxy:** in `vite.config.js`, any request to `/api` is forwarded to the server on port 5000, so the site and server work together smoothly.

---

## 8. Likely viva questions (with short answers)

**Q: Why MongoDB and not MySQL?**
A: Books contain a list of chapters. MongoDB stores that naturally inside one document, with no extra table and no joins. It's also JSON-like, which matches JavaScript.

**Q: How are passwords stored?**
A: Hashed with bcrypt (10 salt rounds), never as plain text. Login compares hashes.

**Q: What is a JWT?**
A: A signed token the server gives you at login. You send it with each request to prove who you are. It's signed with a secret, so it can't be faked.

**Q: What's the difference between 401 and 403?**
A: 401 = "we don't know who you are" (not logged in). 403 = "we know who you are, but you're not allowed" (e.g. a user opening the Admin API, or a locked chapter).

**Q: How do you stop a normal user from using admin features?**
A: The server checks `role === 'admin'` with the `adminOnly` middleware on every admin route. The hidden Admin link on the website is only cosmetic.

**Q: What happens if two people use the last voucher at the same time?**
A: The update is a single atomic database operation with the limit check built in, so only one succeeds. The other gets "just been used up".

**Q: How is the app responsive?**
A: CSS Grid/Flexbox with `auto-fill` grids, plus media queries that stack layouts, collapse the navbar into a menu, and hide the reader's chapter sidebar behind a button on phones.

**Q: Where's the CRUD?**
A: Books (admin C/R/U/D), Vouchers (admin C/R/U/D), Reviews (user C/R/U/D), Library (create by buying, read, update the tag), Users (register, read profile, update name/password).

**Q: Why is chapter text not sent in the book list?**
A: Speed (a whole novel is ~700 KB) and security (locked chapters must never reach the browser).

**Q: What does the seed script do?**
A: It reads `books.json` and the `.txt` files, splits each book into chapters, and upserts them. It also creates the admin account and the test vouchers. `npm run reset` wipes the database first.

---

## 9. Where to look for each feature

| Feature | Server | Client |
|---------|--------|--------|
| Login / sign up | `routes/auth.js`, `middleware/auth.js` | `pages/LoginPage.jsx`, `context/AuthContext.jsx` |
| Store, search, filter | `routes/books.js` (GET `/`) | `pages/StorePage.jsx` |
| Book details | `routes/books.js` (GET `/:id`) | `pages/BookDetailsPage.jsx` |
| Locked chapters | `routes/books.js` (GET `/:id/chapters/:n`) | `pages/ReaderPage.jsx` |
| Buy with voucher | `routes/library.js` (POST `/buy`) | `components/BuyBox.jsx` |
| My Library tags | `routes/library.js` | `pages/LibraryPage.jsx` |
| Reviews | `routes/reviews.js` | `components/Reviews.jsx` |
| Profile | `routes/auth.js` (`/me`) | `pages/ProfilePage.jsx` |
| Admin books | `routes/books.js` (POST/PUT/DELETE) | `components/admin/AdminBooks.jsx`, `BookForm.jsx` |
| Admin vouchers | `routes/vouchers.js` | `components/admin/AdminVouchers.jsx` |
| Book splitting | `utils/splitBook.js`, `scripts/seed.js` | n/a |
