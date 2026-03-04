# iTmethods Financial Schedule

A modern internal web app for creating and managing DSP pricing and financial schedules.
Replaces manual Excel workflows with a live, collaborative, browser-based tool.

## Features

- **Dynamic pricing grid** — up to 8 tool columns + Transit Hub, all services from the DSP template
- **Configurator panel** — toggle each service Mandatory / Included / Optional / Hidden
- **Auto-calculations** — One-Time (N), Monthly (O), Annual (P) totals update in real time
- **EPSS pricing** — host-count × configurable rate (default $175/host/month)
- **Implementation pricing** — days × configurable rate (default $250/day)
- **Discounts** — Platform Setup and Implementation/Migration discounts
- **25 DevOps tools** — GitLab, CloudBees, Coder, GitHub, Jira, etc. + free-text
- **Team collaboration** — schedules saved server-side, shared across the team
- **Export to Excel / PDF / Image**

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Production

```bash
npm run build && npm start
```

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Zustand · xlsx · html2canvas · jsPDF
