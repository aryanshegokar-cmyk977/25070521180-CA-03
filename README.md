# 📚 BookVerse

**A mini Kindle + Goodreads.** Read classic books from Project Gutenberg. Chapter 1 of every book is free; unlock the rest with a voucher code; rate and review what you read.

- **PRN:** 25070521180
- **Assignment:** CA3 (full-stack web app)
- **Backend:** Node.js + Express + MongoDB (Mongoose), login with JWT tokens
- **Frontend:** React (Vite) + React Router + axios, responsive (works on phones)

A **paper-cut storybook** design with hand-drawn scenery and a **day / night** mode.

| ☀️ Day | 🌙 Night |
|---|---|
| ![Store by day](docs/screenshots/02-store.jpg) | ![Store by night](docs/screenshots/17-night-store.jpg) |

More in [Screenshots](#2-screenshots) · how it's built in [How it works](#3-how-it-works) · run it with [section 4 onwards](#4-install-these-on-your-laptop-one-time-only).

---

## 1. What's inside

```
25070521180/              ← the submission folder (named after the PRN)
├── client/               ← the website (React)
│   └── src/
│       ├── pages/        ← reader pages + admin pages (pages/admin/)
│       ├── components/   ← reusable pieces (book cover, stars, Buy box, admin layout & forms...)
│       │   └── art/      ← the hand-drawn paper scenery and cover motifs
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
├── docs/screenshots/     ← pictures used in this README
└── README.md             ← this file
```

### The pages

Readers and admins have **separate logins and separate areas**. Admins only manage the store; they don't buy or review books.

**Reader area**

| # | Page | URL | What it does |
|---|------|-----|--------------|
| 1 | **Login / Sign up** | `/login` | Guards the whole app. Nothing else is visible until you log in. |
| 2 | **Store** (home) | `/` | All books with covers, search by title/author, filter by genre. |
| 3 | **Book Details** | `/books/:id` | Summary, chapter list, star reviews, **Buy Now** with a voucher code. |
| 4 | **Reader** | `/read/:id/:chapter` | Read chapters. Locked chapters show a 🔒 and a Buy box. Bigger/smaller text. |
| 5 | **My Library** | `/library` | Books you bought, with a **progress bar** each, tagged **To Read / Reading / Finished**. |
| 6 | **Profile** | `/profile` | Name, email, books owned, a **Reader's Library Card** (chapters read, streak, stamps), change name, change password. |

**Admin area** (its own dark "staff" look and sidebar)

| # | Page | URL | What it does |
|---|------|-----|--------------|
| 7 | **Admin Login** | `/admin/login` | Staff-only login. No sign-up: the admin account comes from the seed script. |
| 8 | **Dashboard** | `/admin` | Totals (readers, books, books sold, voucher uses, reviews) + recent purchases. |
| 9 | **Books** | `/admin/books` | Create / edit / delete books, including every chapter. |
| 10 | **Vouchers** | `/admin/vouchers` | Create / edit / delete voucher codes; shows Active / Expired / Used up. |
| 11 | **Users** | `/admin/users` | See every reader (books owned, reviews) and delete accounts. |

---

## 2. Screenshots

| | |
|---|---|
| **Login**<br>![Login](docs/screenshots/01-login.jpg) | **Book details + reviews**<br>![Book details](docs/screenshots/05-book-details.jpg) |
| **Locked chapter + voucher error**<br>![Locked chapter](docs/screenshots/04-locked-chapter.jpg) | **My Library**<br>![My Library](docs/screenshots/06-library.jpg) |
| **Profile**<br>![Profile](docs/screenshots/07-profile.jpg) | **Admin login**<br>![Admin login](docs/screenshots/08-admin-login.jpg) |
| **Admin: edit a book's chapters**<br>![Edit book](docs/screenshots/10-admin-edit-book.jpg) | **Admin: users**<br>![Users](docs/screenshots/12-admin-users.jpg) |

**Admin: vouchers**

![Vouchers](docs/screenshots/11-admin-vouchers.jpg)

**Day & night**

| Login by night | Reading by night |
|---|---|
| ![Night login](docs/screenshots/16-night-login.jpg) | ![Night reader](docs/screenshots/18-night-reader.jpg) |

| Reader by day | Admin dashboard |
|---|---|
| ![Reader](docs/screenshots/03-reader.jpg) | ![Admin dashboard](docs/screenshots/09-admin-dashboard.jpg) |

**On a phone**

| Store | Store at night | Menu | Admin |
|---|---|---|---|
| ![Phone store](docs/screenshots/13-phone-store.jpg) | ![Phone store at night](docs/screenshots/19-phone-night-store.jpg) | ![Phone menu](docs/screenshots/14-phone-menu.jpg) | ![Phone admin](docs/screenshots/15-phone-admin.jpg) |

---

## 3. How it works

```
 [ Browser: React website ]  ⇄  [ Express server ]  ⇄  [ MongoDB database ]
          client/                    server/              bookverse database
```

The website never touches the database directly. It sends requests to the server (e.g. `GET /api/books`), and the server checks the rules, then reads or writes MongoDB. They talk in **JSON**.

### Data (Mongoose models)
| Model | Stores | Rules |
|-------|--------|-------|
| **User** | name, email, password, role (`user` / `admin`) | email unique; password **hashed with bcrypt** before saving |
| **Book** | title, author, summary, genre, year, cover colour, list of chapters | `slug` unique (used to match books when re-seeding) |
| **Voucher** | code, max uses, used count, expiry date, who used it | code unique, stored in capitals |
| **Purchase** | which reader owns which book + tag (To Read / Reading / Finished) + reading progress (chapters read, last chapter) | a reader owns each book once |
| **Review** | reader, book, 1-5 stars, comment | one review per reader per book |

### Login and security
- **Passwords** are hashed with bcrypt: scrambled one way, so not even the database holds the real password.
- **Logging in** gives you a **JWT token**: a signed pass with your user id and role, valid for 7 days. The website sends it with every request (`Authorization: Bearer ...`). It's signed with `JWT_SECRET`, so it can't be faked.
- **Separate logins:** `/api/auth/login` only accepts readers and `/api/auth/admin/login` only accepts admins. Sign-up always creates readers; the only admin comes from the seed script.
- **Guessing is limited** (`server/src/middleware/rateLimit.js`): after 10 wrong logins from one computer, or 10 wrong voucher codes from one reader, further attempts are refused for 15 minutes. Successful attempts never count.
- **Server guards** (`server/src/middleware/auth.js`): `protect` (must be logged in, else 401), `adminOnly` (admin features, else 403), `usersOnly` (buying, library, writing reviews, else 403). The website hides pages too (`ProtectedRoute`), but the real protection is on the server.

### Locked chapters
The book list and details never include chapter text, only titles. When you open a chapter, the server sends the text only if it's **chapter 1** (free preview), you **own** the book, or you're an **admin**. Otherwise it answers *403 locked* and the text never reaches the browser.

### Buying with a voucher
Checks, in order, each with its own friendly message: already own the book → code doesn't exist → code expired → all uses gone → you already used this code. Then one **single database step** adds 1 to the used count, but only if the limits still allow it. So if two people grab the last use at the same moment, only one gets it. That was tested with 5 people buying at once: exactly 1 succeeded. Then the Purchase is saved and the book appears in My Library.

### Reading tracker
- Every time the Reader opens a chapter it calls `POST /api/library/progress`. For a book you own, that chapter is added to `chaptersRead` and saved as `lastChapter`, and the tag moves from To Read to Reading.
- **Streak:** reading on a new day adds 1 if you also read yesterday, otherwise it starts again at 1. Free chapter-1 previews count too.
- `GET /api/library/stats` adds it all up for the **navbar badge** (📚 books · 📖 chapters · 🔥 streak), the **Continue reading** card on the Store, and the **stamps** on the Profile's library card (First Ticket, Bookworm, The End, On Fire, Explorer, Collector).

### Whole books → chapters
`server/src/utils/splitBook.js` removes the Project Gutenberg licence text, finds chapter headings with a pattern (lines like "CHAPTER I." / "Chapter 1" / "Letter 1"), and cuts the book there. It also re-joins the hard-wrapped lines into paragraphs while keeping poems' line breaks. If no headings are found, it splits the book into equal "Parts". `npm run seed` saves each book by its `slug`, so re-seeding updates books in place without breaking purchases or reviews.

### Design: paper-cut storybook
- **All art is drawn in code** (SVG), so there are no image files and it stays sharp on any screen: layered paper hills, a little castle, drifting clouds and birds by day, a moon, stars on strings and fireflies by night (`client/src/components/art/`).
- **Book covers are generated** from each book's colour: a cut-paper motif for each book (🐇 Alice, 🔍 Sherlock, ⚡ Frankenstein, ♥ Pride and Prejudice, 🦇 Dracula, ⏳ Time Machine, 🧰 treasure chest, 🌪️ Oz, 🥂 Gatsby, 🗝️ Secret Garden, ⭐ Peter Pan, 🎈 Around the World, 🐾 Hound of the Baskervilles, 🛸 War of the Worlds, 🕯️ Jane Eyre) with the title on a paper label. Hover a card and the motif pops up like a pop-up book (`BookCover.jsx`, `art/Motif.jsx`).
- **Day ⇄ night show:** the sun and moon sit on one big turning "sky wheel", so switching modes makes the sun set behind the hills while the moon rises; paper stars are lowered on strings, clouds slide away, castle windows flicker, fireflies and a shooting star come out. The hills shift slightly with the mouse (parallax).
- **Lighting:** day is a golden autumn afternoon (honey hills, orange and red trees, sunbeams fanning from the sun, a warm haze); night is cold moonlight (silver-blue rim light on the hills, moonbeams, drifting fog, a dark vignette, castle windows as the only warm light).
- **Magic air:** behind every reader page, dry leaves drift down by day and stars twinkle with silver dust by night, filling the empty space at the sides (fainter on the Reader page) (`art/AmbientLayer.jsx`).
- **Paper props:** the voucher box is a ticket (it shakes on a wrong code and throws paper confetti on a right one), locked chapters carry a red wax seal.
- **Day / night mode:** the sun/moon button flips the whole site. It starts from the device's own setting and remembers your choice. All colours are CSS variables switched by `<html data-theme="day|night">` (`context/ThemeContext.jsx`, `index.css`).
- **Readable first:** the Reader stays a calm paper page (Literata font, drop cap, adjustable text size). Animations are gentle and switch off for people who choose "reduce motion" on their device.
- Fonts (Fraunces, Nunito, Literata) are bundled with the app, so it looks the same offline.

### Website (React)
- `App.jsx`: every page and its URL (React Router), with the reader area and admin area each behind their own `ProtectedRoute`.
- `context/AuthContext.jsx`: remembers who's logged in and shares it with every page.
- `api.js`: one axios helper that attaches the token and logs you out if it expires.
- `index.css`: all the styling. Media queries rearrange things on small screens: the navbar becomes a ☰ menu, the reader's chapter list hides behind a button, and the admin sidebar becomes a top bar.

### Testing
Tested against a real MongoDB: **75 API checks** (every route, every voucher rule, permissions) and **40 browser checks** that click through the whole app as a reader and as an admin, on desktop and phone sizes.

---

## 4. Install these on your laptop (one time only)

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

## 5. Get the code

**Option A (easiest):** on the GitHub repo page, click the green **Code** button → **Download ZIP**. Unzip it, then **rename the folder to `25070521180`**.

**Option B (with Git):**

```
git clone https://github.com/aryanshegokar-cmyk977/25070521180-CA-03.git 25070521180
```

(The last word makes the folder name your PRN.)

> If the code is still on the branch `claude/new-session-0jqa05` and not on `main` yet, switch to that branch on GitHub before downloading, or merge the pull request first.

---

## 6. Start the server (backend)

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
*(fills the database with the 15 books, the admin account and the test vouchers)*

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

## 7. Start the website (frontend)

Open a **second** terminal **inside the `client` folder**, then:

```
npm install
npm run dev
```

Open **<http://localhost:5173>** in your browser. 🎉

> Both terminals must stay open while you use the app: one runs the server, the other runs the website.

---

## 8. Logins and voucher codes for testing

**Admin login:** open **<http://localhost:5173/admin/login>** (or click "Admin login →" under the reader login box).

| Email | Password |
|-------|----------|
| `admin@bookverse.com` | `Admin@123` |

**Reader login:** at <http://localhost:5173/login>, click **Sign up** and make a new account.

The two logins are kept apart by the server: the admin account is refused on the reader login, and reader accounts are refused on the admin login.

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
8. Log out, open `/admin/login`, and sign in as admin. Check the dashboard, add a voucher, edit a book, and look at the users list.

---

## 9. See the data in MongoDB Compass

1. Open **MongoDB Compass**.
2. In the connection box, use `mongodb://127.0.0.1:27017` and click **Connect**.
3. Open the **bookverse** database. You'll see 5 collections: `users`, `books`, `vouchers`, `purchases`, `reviews`.
4. Do something in the app (buy a book, write a review), then click **Refresh** in Compass to watch it appear.

Passwords show up as long scrambled text. That's on purpose: they're hashed (scrambled one way), never stored as plain text.

---

## 10. Adding or replacing books (whole books, split into chapters automatically)

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
- You can also edit any chapter in the **Admin area → Books → Edit**.

### Useful commands (in the `server` folder)

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the server (restarts by itself when code changes) |
| `npm run seed` | Add/update books, admin and vouchers. Keeps users, purchases and reviews. |
| `npm run reset` | ⚠️ **Wipes the whole database**, then seeds fresh. Good for a clean demo. |
| `npm run split` | Preview chapter splitting for all books (or `npm run split <slug>` for one) |

---

## 11. API reference (for the marker)

All routes start with `/api`. 🔒 = needs login, 📖 = readers only, 👑 = admins only.

| Method | URL | What it does |
|--------|-----|--------------|
| POST | `/auth/register` | Sign up (always as a normal user) |
| POST | `/auth/login` | Reader login, returns a JWT token (refuses admin accounts) |
| POST | `/auth/admin/login` | Admin login, returns a JWT token (refuses reader accounts) |
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
| POST 📖 | `/library/buy` | Buy a book with `{ bookId, code }` |
| GET 📖 | `/library` | My books |
| PUT 📖 | `/library/:id` | Change tag: To Read / Reading / Finished |
| POST 📖 | `/library/progress` | Reader opened a chapter `{ bookId, chapter }`: saves progress + streak |
| GET 📖 | `/library/stats` | Reading tracker: books owned, chapters read, streak, stamps, continue reading |
| GET 🔒 | `/reviews/book/:bookId` | Reviews for a book |
| POST 📖 | `/reviews` | Write a review `{ bookId, rating, comment }` |
| PUT 📖 | `/reviews/:id` | Edit own review |
| DELETE 🔒 | `/reviews/:id` | Delete own review |
| GET 👑 | `/admin/stats` | Dashboard numbers + recent purchases |
| GET 👑 | `/admin/users` | All reader accounts with books owned and review counts |
| DELETE 👑 | `/admin/users/:id` | Delete a reader (+ their library and reviews) |

---

## 12. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not connect to MongoDB` | MongoDB isn't running. **Windows:** press Win+R, type `services.msc`, find **MongoDB Server**, and click **Start**. **Mac:** `brew services start mongodb-community`. |
| `JWT_SECRET is missing` | You haven't created `server/.env`. See section 6. |
| Website says "Cannot reach the server" | The server terminal isn't running. Start it with `npm run dev` in `server`. |
| `'npm' is not recognized` | Node.js isn't installed, or the terminal was opened before installing. Close the terminal and open a new one. |
| Port already in use | An old copy is still running. Close the other terminals, or restart the laptop. |
| "Too many failed login attempts" / "Too many wrong voucher codes" | The guessing limit kicked in. Wait 15 minutes, or stop and restart the server (`Ctrl+C`, then `npm run dev`) to reset it. |
| Admin password forgotten | Run `npm run seed`. It resets the admin password to the one in `.env`. |

---

## 13. Submitting

1. Delete both `node_modules` folders (`client/node_modules` and `server/node_modules`). They're huge and get rebuilt by `npm install`.
2. Don't include your `.env` file (it's already excluded from GitHub).
3. Zip the `25070521180` folder.

---

**Book texts:** public-domain editions from [Project Gutenberg](https://www.gutenberg.org) (via the GITenberg mirror), with the Gutenberg licence header and footer stripped out when the books are split.
