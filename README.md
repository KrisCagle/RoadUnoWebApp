# SoundRoster

SoundRoster is a music management web app for tracking artists, genres, and tour dates in one place.

## Overview

This project is built for music managers who need a clean way to manage a roster of artists, browse profiles, and keep basic artist information organized.

The current version includes:

- User registration and login
- Persistent login state with local storage
- A branded landing page
- A navigation bar with logo and account menu
- A **My Roster** page connected to a JSON Server database
- Artist photo cards with artist names, origin city, and genre tags
- Artist-to-genre relationships using a join table
- Routing for future pages like **Add Artist**, **Artist Profile**, and **Browse All**

---

## Tech Stack

- **React**
- **React Router**
- **Tailwind CSS**
- **JSON Server**
- **JavaScript**

---

## Current Features

### Authentication
Users can:
- Register for an account
- Log in with email and password
- Stay logged in using local storage
- Log out from the navigation dropdown

### Navigation
The app currently includes:
- **Home**
- **My Roster**
- **Browse All**
- **Artist Profile**
- **Add Artist**
- **Edit Artist**
- **Add Tour Date**

### My Roster
The **My Roster** page:
- Pulls artist data from the database
- Filters artists by the logged-in user
- Displays artist photo cards
- Shows artist name
- Shows artist origin city
- Shows genre bubbles based on `artistGenres` + `genres`

---

## Database Structure

The project currently uses the following resources in `database.json`:

- `users`
- `artists`
- `tourDates`
- `genres`
- `artistGenres`

### Relationships

- A **user** owns many **artists**
- An **artist** has many **tourDates**
- An **artist** can have many **genres**
- A **genre** can belong to many **artists**
- `artistGenres` acts as the join table between artists and genres

---

## Project Structure

```txt
src/
  components/
    NavBar.jsx
  pages/
    Home.jsx
    Login.jsx
    Register.jsx
    MyRoster.jsx
    BrowseAll.jsx
    ArtistProfile.jsx
    AddArtist.jsx
    EditArtist.jsx
    AddTourDate.jsx
  services/
    authService.js
    artistService.js
public/
  images/
    artists/
database.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start JSON Server

Make sure your database is running on port `8088`:

```bash
json-server -p 8088 -w database.json
```

### 3. Start the React app

If this project is using Create React App:

```bash
npm start
```

The frontend should run on:

```txt
http://localhost:3000
```

---

## Image Setup

Artist images are stored in:

```txt
public/images/artists/
```

Example:

```txt
public/images/artists/NovaReyes.jpg
```

Then reference them in `database.json` like this:

```json
"photoUrl": "/images/artists/NovaReyes.jpg"
```

---

## Example Artist Record

```json
{
  "id": "1",
  "name": "Nova Reyes",
  "bio": "Indie-R&B singer-songwriter from Nashville.",
  "photoUrl": "/images/artists/NovaReyes.jpg",
  "originCity": "Nashville, TN",
  "activeSince": 2019,
  "userId": "Q8zjwEq1Ul8"
}
```

---

## Example Genre Relationship

```json
{
  "id": "1",
  "artistId": "1",
  "genreId": "1"
}
```

---

## Routes

Current routes include:

- `/` — Home
- `/login` — Login
- `/register` — Register
- `/roster` — My Roster
- `/artists` — Browse All
- `/artists/:artistId` — Artist Profile
- `/artists/new` — Add Artist
- `/artists/:artistId/edit` — Edit Artist
- `/artists/:artistId/tourdates/new` — Add Tour Date

---

## Styling Notes

The UI uses Tailwind utility classes for:
- Layout and spacing
- Borders and rounded cards
- Shadows and hover effects
- Glass-style card backgrounds
- Responsive grid layouts

---

## Roadmap

Planned next steps include:

- Build the **Add Artist** page
- Build the **Browse All** page fully
- Build the **Artist Profile** page
- Add edit/delete functionality for artists
- Add tour date management
- Add better validation and duplicate email checks
- Improve image uploads
- Improve manager-specific features

---

## Author

Built by Kris Cagle.

