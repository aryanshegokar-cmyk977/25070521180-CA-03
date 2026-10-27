# 📚 BookVerse

**A mini Kindle + Goodreads.** Read classic books from Project Gutenberg. Chapter 1 of every book is free; unlock the rest with a voucher code; rate and review what you read.

- **PRN:** 25070521180
- **Assignment:** CA3 (full-stack web app)
- **Backend:** Node.js + Express + MongoDB (Mongoose), login with JWT tokens
- **Frontend:** React (Vite) + React Router + axios, responsive (works on phones)

---

## 1. What's inside

```
25070521180/              ← the submission folder (named after the PRN)
├── client/               ← the website (React)
│   └── src/
│       ├── pages/        ← the 7 pages
│       ├── components/   ← reusable pieces (book cover, stars, Buy box, admin forms...)
│       ├── context/      ← remembers who is logged in
│       └── api.js        ← talks to the server
├── server/               ← the backend (Node.js + Express)
│   ├── src/
│   │   ├── models/       ← shape of the data: User, Book, Voucher, Purchase, Review
│   │   ├── routes/       ← the API (all the create / read / update / delete actions)
│   │   ├── middleware/   ← login guard + error messages
│   │   └── utils/        ← the chapter splitter
│   ├── scripts/          ← seed (fill the database) + split preview
│   └── data/
│       ├── books.json    ← the list of books
│       └── books/        ← the full text of each book (.txt)
├── README.md             ← this file
└── VIVA_GUIDE.md         ← plain-English explanation of how everything works
```

### The 7 pages

| # | Page | What it does |
|---|------|--------------|
| 1 | **Login / Sign up** | Guards the whole app. Nothing else is visible until you log in. |
| 2 | **Store** (home) | All books with covers, search by title/author, filter by genre. |
| 3 | **Book Details** | Summary, chapter list, star reviews, **Buy Now** with a voucher code. |
| 4 | **Reader** | Read chapters. Locked chapters show a 🔒 and a Buy box. Bigger/smaller text. |
| 5 | **My Library** | Books you bought, tagged **To Read / Reading / Finished**. |
| 6 | **Profile** | Name, email, books owned, change name, change password. |
| 7 | **Admin Panel** | Create / edit / delete **books** (and their chapters) and **voucher codes**. Admins only. |

---

## 2. Install these on your laptop (one time only)

1. **Node.js**: go to <https://nodejs.org>, download the **LTS** version, and install it (click Next until it's done).
2. **MongoDB Community Server**: go to <https://www.mongodb.com/try/download/community>, pick your system, and download.
   - **Windows:** run the installer, choose **Complete**, and leave **"Install MongoD as a Service"** ticked so MongoDB starts by itself. Leave **"Install MongoDB Compass"** ticked too.
   - **Mac:** the easiest way is [Homebrew](https://brew.sh). In Terminal:
     `brew tap mongodb/brew` → `brew install mongodb-community` → `brew services start mongodb-community`
3. **MongoDB Compass** (the app for looking inside the database): if the installer didn't add it, get it from <https://www.mongodb.com/try/download/compass>.
4. **VS Code** (optional, for opening the code): <https://code.visualstudio.com>.

**Check it worked:** open a terminal (Windows: search for **Command Prompt**; Mac: **Terminal**) and type:

```
node -v
npm -v
```

If you see version numbers, you're good.

---

## 3. Get the code

**Option A (easiest):** on the GitHub repo page, click the green **Code** button → **Download ZIP**. Unzip it, then **rename the folder to `25070521180`**.

**Option B (with Git):**

```
git clone https://github.com/aryanshegokar-cmyk977/25070521180-CA-03.git 25070521180
```

(The last word makes the folder name your PRN.)

> If the code is still on the branch `claude/new-session-0jqa05` and not on `main` yet, switch to that branch on GitHub before downloading, or merge the pull request first.

---

## 4. Start the server (backend)

Open a terminal **inside the `server` folder**. In VS Code: right-click the `server` folder → **Open in Integrated Terminal**. Then type these one by one:

```
npm install
```
*(downloads the server's packages; takes a minute)*

**Create the settings file.** Copy `.env.example` and name the copy `.env`:

- Windows: `copy .env.example .env`
- Mac: `cp .env.example .env`

```
npm run seed
```
*(fills the database with the 4 books, the admin account and the test vouchers)*

```
npm run dev
```

You should see:

```
MongoDB connected: bookverse
BookVerse server running at http://localhost:5000
```

**Leave this terminal open.** To check it's working, open <http://localhost:5000/api/health> in your browser. It should say `"status":"ok"`.

---

## 5. Start the website (frontend)

Open a **second** terminal **inside the `client` folder**, then:

```
npm install
npm run dev
```

Open **<http://localhost:5173>** in your browser. 🎉

> Both terminals must stay open while you use the app: one runs the server, the other runs the website.

---

## 6. Logins and voucher codes for testing

**Admin login**

| Email | Password |
|-------|----------|
| `admin@bookverse.com` | `Admin@123` |

To test as a normal user, click **Sign up** and make a new account.

**Voucher codes**

| Code | What happens |
|------|--------------|
| `WELCOME50` | ✅ Works. 50 uses in total. |
| `FREEBOOK` | ✅ Works **once only**. The second person gets "fully used up". |
| `EXAM2026` | ✅ Works until **31 Dec 2026**. |
| `OLDCODE` | ❌ Already expired. Shows the "expired" message. |
| `HELLO123` (anything made up) | ❌ Shows the "not a valid code" message. |

**Rules:** one voucher use = one book. Each person can use a given code only once. If you already own the book, you're told so and the code is not used up.

**A good demo order:**
1. Sign up as a new user.
2. Open a book and read Chapter 1 (free).
3. Try Chapter 2 and see the lock.
4. Try `OLDCODE` (expired), then `NOPE` (invalid).
5. Buy with `FREEBOOK` (it works).
6. Make a second account and try `FREEBOOK` again (fully used).
7. Write a review and change the tag in My Library.
8. Log in as admin and add a voucher or edit a book.

---

## 7. See the data in MongoDB Compass

1. Open **MongoDB Compass**.
2. In the connection box, use `mongodb://127.0.0.1:27017` and click **Connect**.
3. Open the **bookverse** database. You'll see 5 collections: `users`, `books`, `vouchers`, `purchases`, `reviews`.
4. Do something in the app (buy a book, write a review), then click **Refresh** in Compass to watch it appear.

Passwords show up as long scrambled text. That's on purpose: they're hashed (scrambled one way), never stored as plain text.

---

## 8. Adding or replacing books (whole books, split into chapters automatically)

You **don't** need to cut books into chapters by hand. Drop in the whole book and the seed script finds the chapter headings ("CHAPTER I.", "Chapter 1", "Letter 1"...) and splits it for you.

### To add a new book

1. On <https://www.gutenberg.org>, open the book and download **"Plain Text UTF-8"**.
2. Save the file into `server/data/books/`, e.g. `server/data/books/dracula.txt`.
3. Open `server/data/books.json` and add an entry (don't forget the comma between entries):
   ```json
   {
     "slug": "dracula",
     "title": "Dracula",
     "author": "Bram Stoker",
     "year": 1897,
     "genre": "Horror",
     "gutenbergId": 345,
     "coverColor": "#7f1d1d",
     "summary": "Jonathan Harker travels to Transylvania...",
     "textFile": "dracula.txt"
   }
   ```
   `slug` is a short unique name (lowercase, dashes instead of spaces). `coverColor` is any colour code; pick one at <https://htmlcolorcodes.com>.
4. **Preview the split** (saves nothing). In the `server` folder:
   ```
   npm run split dracula
   ```
   You'll see every chapter found, with its word count and first few words.
5. If it looks right:
   ```
   npm run seed
   ```

### To replace a book's text
Swap the `.txt` file in `server/data/books/` (keep the same file name), then run `npm run split <slug>` and `npm run seed`. Books are matched by `slug`, so **purchases and reviews are kept**.

### If the chapters come out wrong
- **"No chapter headings found, split into equal parts":** the book uses different headings. Add a `chapterPattern` to its entry. Look at `sherlock-holmes` in `books.json` for an example; its stories are headed "ADVENTURE I. ..." instead of "Chapter".
- **A contents page gets counted as chapters:** very short sections (under 200 characters) are skipped automatically and listed as "Skipped".
- **Rather type chapters yourself?** Leave out `textFile` and give a `chapters` list instead:
  ```json
  "chapters": [
    { "title": "Chapter 1", "content": "Text of chapter one..." },
    { "title": "Chapter 2", "content": "Text of chapter two..." }
  ]
  ```
- You can also edit any chapter in the **Admin Panel → Books → Edit**.

### Useful commands (in the `server` folder)

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the server (restarts by itself when code changes) |
| `npm run seed` | Add/update books, admin and vouchers. Keeps users, purchases and reviews. |
| `npm run reset` | ⚠️ **Wipes the whole database**, then seeds fresh. Good for a clean demo. |
| `npm run split` | Preview chapter splitting for all books (or `npm run split <slug>` for one) |

---

## 9. API reference (for the marker)

All routes start with `/api`. 🔒 = needs login, 👑 = admin only.

| Method | URL | What it does |
|--------|-----|--------------|
| POST | `/auth/register` | Sign up (always as a normal user) |
| POST | `/auth/login` | Log in, returns a JWT token |
| GET 🔒 | `/auth/me` | Current user + number of books owned |
| PUT 🔒 | `/auth/me` | Change name |
| PUT 🔒 | `/auth/me/password` | Change password |
| GET 🔒 | `/books?q=&genre=` | List / search books (no chapter text) |
| GET 🔒 | `/books/genres` | List of genres |
| GET 🔒 | `/books/:id` | Book details + chapter titles with locked/unlocked |
| GET 🔒 | `/books/:id/chapters/:n` | Chapter text (403 "locked" unless chapter 1, owner, or admin) |
| GET 👑 | `/books/:id/full` | Full book with all chapter text (for editing) |
| POST 👑 | `/books` | Create book |
| PUT 👑 | `/books/:id` | Update book |
| DELETE 👑 | `/books/:id` | Delete book (+ its purchases and reviews) |
| GET/POST 👑 | `/vouchers` | List / create vouchers |
| PUT/DELETE 👑 | `/vouchers/:id` | Update / delete voucher |
| POST 🔒 | `/library/buy` | Buy a book with `{ bookId, code }` |
| GET 🔒 | `/library` | My books |
| PUT 🔒 | `/library/:id` | Change tag: To Read / Reading / Finished |
| GET 🔒 | `/reviews/book/:bookId` | Reviews for a book |
| POST 🔒 | `/reviews` | Write a review `{ bookId, rating, comment }` |
| PUT/DELETE 🔒 | `/reviews/:id` | Edit / delete own review (admins can delete any) |

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not connect to MongoDB` | MongoDB isn't running. **Windows:** press Win+R, type `services.msc`, find **MongoDB Server**, and click **Start**. **Mac:** `brew services start mongodb-community`. |
| `JWT_SECRET is missing` | You haven't created `server/.env`. See step 4. |
| Website says "Cannot reach the server" | The server terminal isn't running. Start it with `npm run dev` in `server`. |
| `'npm' is not recognized` | Node.js isn't installed, or the terminal was opened before installing. Close the terminal and open a new one. |
| Port already in use | An old copy is still running. Close the other terminals, or restart the laptop. |
| Admin password forgotten | Run `npm run seed`. It resets the admin password to the one in `.env`. |

---

## 11. Submitting

1. Delete both `node_modules` folders (`client/node_modules` and `server/node_modules`). They're huge and get rebuilt by `npm install`.
2. Don't include your `.env` file (it's already excluded from GitHub).
3. Zip the `25070521180` folder.

---

**Book texts:** public-domain editions from [Project Gutenberg](https://www.gutenberg.org) (via the GITenberg mirror), with the Gutenberg licence header and footer stripped out when the books are split.
