---
name: tour-routing
description: Use this skill whenever analyzing, validating, or generating a tour itinerary or routing plan for a musician or touring act — including checking drive-time feasibility between shows, flagging risky routing, recommending day-off placement, or evaluating whether a set of tour dates makes geographic sense. Trigger on any request involving tour dates, routing, itinerary review, drive times, "will this schedule work," or booking feasibility, even if the user doesn't use the word "routing" explicitly.
---

# Tour Routing

Domain heuristics for evaluating and building feasible tour routes for independent/DIY touring musicians. Encodes the routing logic behind RoadUno's tour planning.

## Core heuristics

1. **Drive time between shows**
   - <= 8 hours: OK, no flag.
   - 8-10 hours: flag as **tight** — feasible only with an early departure (on the road by ~9-10am after the previous night's load-out) and no meaningful stops.
   - > 10 hours: flag as **not feasible** without inserting an off-day before or after that leg.

2. **Day-off cadence**
   - Recommend at least one day off after every 3 consecutive travel+show days.
   - A day off is mandatory immediately before or after any leg flagged "not feasible" above.

3. **Geographic clustering (avoid zigzag)**
   - The route should move in a roughly consistent direction across the tour.
   - Flag any leg where the next city sits meaningfully further from the overall route line than the prior city did.

4. **Budget-aware prioritization**
   - When a budget or per-diem constraint is given, treat long-drive legs as higher cost risk.
   - If dates need to be cut to fit budget, flag long-drive legs as the first candidates to reconsider.

## Output format

For each leg, report:
`[From city] -> [To city] — [distance/est. drive time] — [OK / TIGHT / NOT FEASIBLE] — [one-line reasoning]`

Close with an overall verdict, suggested day-off insertions, and any zigzag/backtracking flags.

## Assumptions to state explicitly

- Vehicle type (van/bus vs. personal car)
- Whether there's a driver who can trade off, or the artist is driving solo
- Regional norms (I-95 corridor traffic vs. open western highway miles)

If unspecified, use the defaults above and say so, rather than blocking the report.
