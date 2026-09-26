# Frontline rating portal prototype

A personal front-end prototype for recording structured service observations. It demonstrates an associate list, a rating form, a seven-item checklist, and a weighted score. This repository contains no confidential company records.

## Implementation

- `index.html` and `app.js` manage the associate list. The list is stored in browser `localStorage`.
- `rate.html` and `rate.js` collect six category ratings, checklist responses, notes, and customer count.
- The form sends a `submit_rating` JSON payload to a configured backend endpoint.

## Run locally

Serve the folder with a simple static server, such as `python -m http.server 8000`, and open `http://localhost:8000`. The submission flow requires a compatible backend. Replace the `window.BACKEND_URL` value in the HTML files with an endpoint you control before using the form. Do not enter real employee data into a public demo backend.

## Scope

This repository is a **prototype front end**. It does not include the backend, authentication, or production data controls. See [the read-only sample dashboard](https://github.com/teme251/rsa-monitor) for a demo that runs without a backend.
