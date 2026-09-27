# RSA Operations Portal — Structured Observation & Assessment

A front-end application prototype for structured service-observation capture. The workflow connects associate selection, six category ratings, a seven-item checklist, notes, customer count, and a weighted score within a consistent assessment interface. This repository contains no confidential company records.


## Engineering focus

The project translates an observation workflow into structured inputs and a defined JSON submission contract. Browser state maintains the associate list, while the assessment form collects the information needed by a compatible backend. The engineering emphasis is consistency between interaction, captured fields, and the submission payload.

[Read the portfolio case study](https://teme251.github.io/teme251/project-rsa.html)

## Implementation

- `index.html` and `app.js` manage the associate list. The list is stored in browser `localStorage`.
- `rate.html` and `rate.js` collect six category ratings, checklist responses, notes, and customer count.
- The form sends a `submit_rating` JSON payload to a configured backend endpoint.

## Run locally

Serve the folder with a simple static server, such as `python -m http.server 8000`, and open `http://localhost:8000`. The submission flow requires a compatible backend. Replace the `window.BACKEND_URL` value in the HTML files with an endpoint you control before using the form. Do not enter real employee data into a public demo backend.

## Scope

This repository is a **prototype front end**. It does not include the backend, authentication, or production data controls. See [the read-only sample dashboard](https://github.com/teme251/rsa-monitor) for a demo that runs without a backend.
