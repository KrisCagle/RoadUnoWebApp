# RoadUno

RoadUno is a tour assistant for independent artists that optimizes routing, finds venue leads, and saves money.

## Setup Instructions

### Google API Configuration

To enable map features (Tour Assistant, Route Planning), you must configure a Google API Key.

1.  **Get an API Key**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Enable the following APIs:
        *   **Maps JavaScript API**
        *   **Places API**
        *   **Geocoding API**
    *   Create Credentials -> API Key.

2.  **Configure Environment**:
    *   Copy `.env.example` to `.env.local` if you haven't already.
    *   Add your key to `.env.local`: