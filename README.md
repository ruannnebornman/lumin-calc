# LuminCalc

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ruannnebornman/lumincalc)

A small, beautiful, fast calculator web app with polished UI, smooth interactions, keyboard support, and a compact history/memory panel.

## Overview

LuminCalc is a minimal calculator web application designed with a focus on visual excellence, intuitive user experience, and responsive design. Built on modern web technologies, it features a single, elegant interface with expression parsing, evaluation, memory functions, and a collapsible history drawer. The app emphasizes minimalist design with warm gradients, smooth animations, and accessibility, making it delightful to use on any device.

Key highlights:
- **Visual Polish**: Modern UI with shadcn/ui components, Tailwind CSS, and framer-motion for micro-interactions.
- **Core Functionality**: Robust client-side expression evaluation using shunting-yard algorithm, supporting operators, parentheses, and unary minus.
- **User-Friendly**: Keyboard input support (numbers, operators, Enter to evaluate, Backspace to delete), in-memory history, and memory operations (M+, M-, MR, MC).
- **Responsive**: Mobile-first layout that adapts seamlessly from stacked keypad on mobile to side-by-side panels on desktop.
- **No Backend Dependencies**: Fully client-side for Phase 1, with optional Cloudflare Workers integration.

## Key Features

- **Expression Parsing & Evaluation**: Safe, custom parser handles complex math expressions without `eval()`.
- **Interactive Keypad**: Touch-friendly buttons with hover effects, focus rings, and press animations.
- **History & Memory**: Compact drawer for past calculations; single-value memory storage.
- **Keyboard Support**: Full numeric keypad emulation for desktop and mobile.
- **Theme Support**: Light/dark mode toggle.
- **Error Handling**: Graceful errors with friendly messages and toast notifications.
- **Performance**: Instant feedback, capped input length, and smooth 60fps interactions.

## Technology Stack

- **Frontend**: React 18, TypeScript, React Router
- **UI & Styling**: shadcn/ui, Tailwind CSS v3, Lucide React icons, Framer Motion (animations)
- **State Management**: Zustand (lightweight store for history/memory)
- **Utilities**: clsx, tailwind-merge, date-fns, sonner (toasts)
- **Backend/Deployment**: Cloudflare Workers, Hono (routing), Wrangler
- **Build Tools**: Vite, Bun (package manager), ESLint, TypeScript
- **Other**: Immer (immutable updates), Zod (validation, if extended)

## Installation

This project uses Bun as the package manager for faster setup and development. Ensure you have Bun installed (version 1.0+).

1. Clone the repository:
   ```
   git clone <repository-url>
   cd lumin-calc
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. (Optional) Generate Cloudflare Worker types:
   ```
   bun run cf-typegen
   ```

The project is now ready for development or deployment.

## Usage

Run the development server:
```
bun run dev
```

Open `http://localhost:3000` (or the port shown in the terminal) to view the app. The calculator is centered on the homepage with a gradient background. Interact via mouse/touch or keyboard:

- Enter expressions like `2 + 3 * (4 - 1)` and press Enter or `=` to evaluate.
- Use memory buttons: M+ (add to memory), M- (subtract from memory), MR (recall), MC (clear).
- Open the history drawer to view/reload past results.
- Toggle theme with the sun/moon icon in the top-right.

For production build:
```
bun run build
```

Serve the built assets from `dist/` using any static server.

## Development

### Project Structure

- `src/pages/HomePage.tsx`: Main calculator implementation.
- `src/components/ui/*`: Pre-built shadcn/ui components (do not modify).
- `src/hooks/*`: Custom hooks for theme and mobile detection.
- `worker/*`: Cloudflare Worker routes (extend via `userRoutes.ts` for API features).
- `src/lib/utils.ts`: Classname utilities.

### Running Tests

Linting is pre-configured:
```
bun run lint
```

Add tests using Vitest (not included by default; extend as needed).

### Adding Features

- Extend the calculator logic in `HomePage.tsx` for new operators or precision settings.
- For persistence, add routes in `worker/userRoutes.ts` and integrate with KV storage.
- Customize styles in `src/index.css` or extend `tailwind.config.js`.

### Common Commands

- Development: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`
- Lint: `bun run lint`
- Deploy: `bun run deploy` (see Deployment section)

## Deployment

This project is optimized for Cloudflare Workers and Pages. Use Wrangler for seamless deployment.

1. Ensure Wrangler is installed globally:
   ```
   bun add -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```
   wrangler login
   ```

3. Deploy to Cloudflare Workers:
   ```
   bun run deploy
   ```

   This builds the app and deploys the Worker, serving static assets from Cloudflare.

4. For custom domain or Pages integration, update `wrangler.jsonc` and run:
   ```
   wrangler deploy --name lumin-calc
   ```

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ruannnebornman/lumincalc)

### Environment Variables

No required env vars for core functionality. For production, set bindings in `wrangler.jsonc` if using KV or Durable Objects.

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Follow the code style (ESLint enforced) and ensure no breaking changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.