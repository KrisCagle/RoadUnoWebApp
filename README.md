# 🎸 RoadUno

**Tour planning and venue discovery for independent artists.**

RoadUno helps musicians and their managers plan smarter tours: mapping routes, finding venues, tracking show history, and running the numbers, all in one place.

🌐 **Live site:** [www.roaduno.com](https://www.roaduno.com)

---

## Features

- **Tour Routing Planner**: Build and optimize multi city tour routes
- **Venue Discovery**: Browse and save venue leads that fit your draw size and goals
- **Manager Dashboard**: Separate view for managers to oversee multiple artists, track analytics, and review venue performance
- **Break Even Calculator**: Know exactly what a show needs to make financial sense
- **Merch Profit Calculator**: Estimate merch margins and break even points
- **AI Tour Assistant**: AI powered recommendations for routing and show planning
- **Show History**: Track past performances and activity over time
- **Artist Profiles**: Public facing profile pages for artists
- **Route Templates**: Save and reuse common touring routes
- **Auth & Subscriptions**: Secure login via Supabase with subscription gated feature access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JSX) + Vite |
| UI Components | shadcn style component library |
| Backend / Auth / DB | Supabase |
| AI Integration | AI proxy via Google Cloud Functions |
| Maps / Places | Google Maps JavaScript API, Places API, Geocoding API |
| Ads | Google AdSense |
| Routing | React Router |

---

## Project Structure

```
src/
├── pages/                 # Route level page components
│   ├── HomePage.jsx
│   ├── TourRoutingPlannerPage.jsx     # Core tour route builder
│   ├── VenueLeadsPage.jsx             # Venue discovery and lead tracking
│   ├── TourAssistantPage.jsx          # AI powered tour assistant (v1)
│   ├── TourAssistantV2Page.jsx        # AI powered tour assistant (v2)
│   ├── ManagerDashboardPage.jsx       # Manager multi artist overview
│   ├── ManagerVenueAnalyticsPage.jsx  # Venue performance analytics
│   ├── BreakEvenCalculatorPage.jsx    # Show financial calculator
│   ├── MerchProfitCalculatorPage.jsx  # Merch margin calculator
│   ├── ArtistProfilePage.jsx          # Public artist profile
│   ├── DashboardPage.jsx              # Artist dashboard
│   ├── ShowHistoryPage.jsx            # Past shows and activity log
│   └── ...                            # Auth, billing, pricing, and settings pages
├── components/             # Shared UI components
│   └── ui/                 # shadcn style primitives
├── contexts/                # React context providers (auth, etc.)
├── services/                # External API integrations (Google Places, AdSense, AI client)
├── config/                   # AI proxy and Google API configuration
├── hooks/                     # Shared React hooks (subscriptions, tour quota, etc.)
├── lib/                        # Supabase client, feature gates, activity logging
├── utils/                       # Shared helper functions
└── data/                         # Static resource content
```

---

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)
- A Google Cloud API key (for maps and places features)

### Installation

```bash
git clone https://github.com/KrisCagle/RoadUnoWebApp.git
cd RoadUnoWebApp
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_AI_PROXY_ENDPOINT=your_ai_proxy_endpoint
```

## Claude Skills

This repo includes custom Claude Code skills and subagents under `.claude/`, used during development for tour routing feasibility checks and venue outreach drafting. See `.claude/skills/` and `.claude/agents/` for details.

---

## About

RoadUno was built by [Kristofer Cagle](https://github.com/KrisCagle), a Nashville based developer, to solve a real problem in the independent music industry: tour planning is fragmented, expensive, and inaccessible for artists without a team.

The goal is to give independent artists the same planning tools that major label artists take for granted.

---

## License

This project is proprietary. All rights reserved.
