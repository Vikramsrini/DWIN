# UI Tests (Playwright)

Automated end-to-end testing for the Digital Twin Health Tracker frontend.

## Test Files

| File | Coverage |
|------|----------|
| `auth.spec.js` | Login/Register forms, validation |
| `dashboard.spec.js` | Digital twin avatar, metrics display |
| `activities.spec.js` | Activity logging modal, form submission |
| `twin-status.spec.js` | Health score, aura visualization, charts |

## Commands

```bash
# Install Playwright browsers (one-time)
npx playwright install

# Run all UI tests (headless)
npm run test:ui

# Run tests with visible browser
npm run test:ui:headed

# Debug mode
npm run test:ui:debug

# View HTML report
npx playwright show-report
```

## Browsers Tested

- Chromium (Chrome)
- Firefox
- WebKit (Safari)

## Configuration

See `playwright.config.js` for:
- Base URL: `http://localhost:3000`
- Screenshots on failure
- Video recording on retry
- Auto-starting dev server
