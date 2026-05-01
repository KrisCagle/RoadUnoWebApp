# 🎸 RoadUno

**Tour planning and venue discovery for independent artists.**

RoadUno helps musicians and their managers plan smarter tours — mapping routes, finding venues, tracking show history, and running the numbers — all in one place.

🌐 **Live site:** [www.roaduno.com](https://www.roaduno.com)

---

## Features

- **Tour Routing Planner** — Build and optimize multi-city tour routes
- **Venue Discovery** — Browse and save venue leads that fit your draw size and goals
- **Manager Dashboard** — Separate view for managers to oversee multiple artists, track analytics, and review venue performance
- **Break-Even Calculator** — Know exactly what a show needs to make financial sense
- **AI Tour Assistant** — AI-powered recommendations for routing and show planning
- **Show History** — Track past performances and activity over time
- **Artist Profiles** — Public-facing profile pages for artists
- **Auth & Subscriptions** — Secure login via Supabase with subscription-gated feature access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JSX) |
| UI Components | Custom component library (shadcn-style) |
| Backend / Auth / DB | Supabase |
| AI Integration | AI client proxy (Claude / OpenAI) |
| Ads | Google AdSense |
| Routing | React Router |

---

## Project Structure

```
/
├── TourRoutingPlannerPage.jsx     # Core tour route builder
├── VenueLeadsPage.jsx             # Venue discovery and lead tracking
├── ManagerDashboardPage.jsx       # Manager multi-artist overview
├── ManagerVenueAnalyticsPage.jsx  # Venue performance analytics
├── BreakEvenCalculatorPage.jsx    # Show financial calculator
├── TourAssistantPage.jsx          # AI-powered tour assistant (v1)
├── TourAssistantV2Page.jsx        # AI-powered tour assistant (v2)
├── ArtistProfilePage.jsx          # Public artist profile
├── DashboardPage.jsx              # Artist dashboard
├── ShowHistoryPage.jsx            # Past shows and activity log
├── AuthModal.jsx                  # Login / signup flow
├── customSupabaseClient.js        # Supabase configuration
├── aiClient.js / aiProxy.js       # AI integration layer
├── featureGates.js                # Subscription feature gating
└── activityLogger.js              # User activity tracking
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)

### Installation

```bash
git clone https://github.com/KrisCagle/RoadUnoWebApp.git
cd RoadUnoWebApp
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_API_KEY=your_ai_api_key
```

### Run Locally

```bash
npm run dev
```

---

## About

RoadUno was built by [Kristofer Cagle](https://github.com/KrisCagle), an MTSU grad and Nashville-based developer, to solve a real problem in the independent music industry: tour planning is fragmented, expensive, and inaccessible for artists without a team.

The goal is to give independent artists the same planning tools that major-label artists take for granted.

---

## License

This project is proprietary. All rights reserved.



