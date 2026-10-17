# EuroNight UBC

Event site for EuroNight, a night out at the Pit hosted by six UBC student clubs
(ITASA, Greek SA, TSA, Francophone, XISC and the Balkan club).
Thursday, November 26, 10 PM to 3 AM.


## What's on the page

- Video hero with a live countdown to doors opening
- Split-flap departures board for the event details
- The six host clubs as stops on a train line, each opening a preview of their Instagram
- Photo reel from past EuroNights with a swipeable lightbox
- Interactive LED dance floor
- FAQ styled as a drinks menu
- Language switcher

## Stack

Plain HTML, CSS and JavaScript in a single `index.html`. No framework and no build step.
Hosted on Vercel.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Notes

Built with Claude as a coding assistant. I directed the design and content, reviewed the code, and handled deployment.
Respects `prefers-reduced-motion` and is keyboard navigable.
