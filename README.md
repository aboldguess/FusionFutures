# Fusion Futures Hub

Fusion Futures Hub is a modern, role-aware digital platform for the National Fusion Skills Hub. It delivers:

- Secure role switching for super administrators, administrators, employers, educators, jobseekers, and learners.
- A social-style Impact Feed with rich analytics and contextual prompts so users know what to do immediately.
- Employer and educator microsites with branding controls and LinkedIn-powered enrichment.
- An Events Hub with one-click attendee management and calendar-friendly scheduling.
- Administrative tooling for moderating users and tailoring the platform appearance.

The repository is structured as a lightweight monorepo to keep shared types and future packages organised.

## Prerequisites

| Tool | Recommended version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20.x LTS | Required for the Next.js app. |
| [npm](https://www.npmjs.com/) | 10.x | Ships with Node.js 20. |
| [Git](https://git-scm.com/) | Latest stable | For cloning and contribution workflows. |

> Security note: only official Node.js and Git builds are supported. Avoid unverified mirrors.

## Quick start scripts

A helper script is included to streamline local setup:

```bash
bash scripts/bootstrap-web.sh
```

The script installs dependencies, copies example environment variables, and explains the available commands. Feel free to read it before executing so you understand each step.

## Manual setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/FusionFutures.git
cd FusionFutures
```

### 2. Create an isolated environment

- **Linux / Raspberry Pi**
  ```bash
  sudo apt update && sudo apt install -y curl build-essential
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  node --version
  npm --version
  ```

- **Windows (PowerShell)**
  ```powershell
  winget install OpenJS.NodeJS.LTS
  node --version
  npm --version
  ```

> If you already use a Node version manager (such as `nvm` or `fnm`), install Node.js 20.x through that tool instead.

### 3. Install dependencies

```bash
npm install
npm install --prefix apps/web
```

### 4. Configure environment variables

Copy the example file and tailor it to your needs (ports, feature flags, etc.).

```bash
cp apps/web/.env.example apps/web/.env.local
```

Adjust the following variables:

- `PORT` – changes the port used by both `npm run dev:web` and `npm run start:web`.
- `FF_DEBUG` – set to `true` to enable verbose logging in the browser (also toggle via localStorage `ff-debug`).

### 5. Run the development server

```bash
PORT=4000 npm run dev:web
```

Visit `http://localhost:4000` (or the port you selected). The UI includes clear on-screen instructions, so you never need to flip back to the README while using the product.

### 6. Production build

```bash
npm run build:web
npm run start:web
```

The `start` command respects the `PORT` environment variable so you can host behind any reverse proxy. Use `NODE_ENV=production` to mimic a live deployment.

### 7. Linting and tests

```bash
npm run lint:web
npm run test:web
```

Vitest currently executes zero tests (the suite is ready for future expansion) and exits successfully.

## Repository structure

```
FusionFutures/
├── README.md              # Platform overview and setup instructions (this file)
├── package.json           # Workspace scripts delegating to the web app
├── apps/
│   └── web/               # Next.js application
│       ├── package.json   # Web-specific dependencies and scripts
│       └── src/           # Application source (app router, components, data)
├── packages/              # Reserved for shared packages (types, UI kits)
└── scripts/               # Automation helpers
```

## Security and privacy posture

- No third-party analytics are bundled. Any future integrations should flow through a consent-aware module.
- All logging is routed through a safe helper that can be disabled via environment variables or local storage.
- Only well-established, actively maintained libraries are used (Next.js, TailwindCSS, React Query, Headless UI).

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`.
2. Ensure commands listed above pass without errors.
3. Commit using clear, conventional messages.
4. Submit a pull request with screenshots where visual changes are involved.

## Accessibility and UX

- Dark theme with high contrast for readability.
- Prominent instructions and checklists appear at the top of each page.
- Keyboard-friendly controls and focus styles are enabled via Tailwind defaults.

## Deployment guidance

The app is a standard Next.js project. You can deploy with Vercel, Netlify, Azure Static Web Apps, or any platform that supports Node.js. Ensure the following environment variables are configured in your hosting provider:

- `PORT` (if the hosting provider requires an explicit port binding)
- `NODE_ENV=production`
- `FF_DEBUG` for log verbosity (optional)

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| Port already in use | Change the `PORT` value when running `npm run dev:web`. |
| Cannot install dependencies | Clear the workspace with `rm -rf node_modules package-lock.json` in the root and web app, then reinstall. |
| Styling not applied | Ensure `tailwind.config.ts` and `postcss.config.mjs` remain intact; run `npm run lint:web` to spot configuration drift. |

Happy building! Reach out to the Fusion Futures platform team for further assistance.
