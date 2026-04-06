# Summer Activity Tracker

This project now supports both:
- **Desktop app** (Electron)
- **Web app** (Vite, deployable to Vercel)

## Run as a web app

```bash
npm install
npm run dev:web
```

## Build web app

```bash
npm run build:web
```

Output is generated in `dist/renderer`.

## Deploy to Vercel

### Option 1: Vercel Dashboard
1. Import this project in Vercel.
2. Framework preset: **Vite**
3. Build command: `npm run build:web`
4. Output directory: `dist/renderer`

`vercel.json` is already configured, including SPA rewrites.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Notes on storage and photos

- In **Electron**, data uses `electron-store` and photos use local file paths.
- In **web**, data uses `localStorage` and uploaded photos are saved as data URLs in the browser.

This means web data stays on the browser/device unless you add a backend sync layer.
# Summer Activity Tracker 🌞

A beautiful BeReal-inspired desktop app to track and complete summer activities with your best friend. Built with Electron, React, and TypeScript.

## Features

✨ **Multiple View Modes**
- List View - Classic activity checklist
- Card View - Pinterest-style masonry grid
- Kanban Board - Drag-and-drop To Do / In Progress / Done
- Timeline View - Calendar with completed activities
- Recap View - Statistics and photo memories

📸 **Photo Memories**
- Upload photos for completed activities
- Photo gallery with lightbox view
- Add captions to your photos

🔔 **Smart Notifications**
- Daily activity suggestions
- Customizable active hours
- Desktop notifications

📊 **Recaps & Analytics**
- Weekly, monthly, and summer-long recaps
- Completion statistics and streaks
- Beautiful timeline graphs
- Photo grid of all your memories

🎯 **AI Activity Suggestions**
- 50+ preset summer activities
- Smart suggestions based on time of day
- Category-based recommendations

🎨 **Beautiful Summer Theme**
- Warm, vibrant color palette
- Smooth animations
- Modern, clean UI

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Run the app in development mode:

```bash
npm run dev
```

This will start both the Vite dev server and Electron in watch mode.

## Building

Build the app for production:

```bash
npm run build
```

Package the app for your platform:

```bash
# macOS
npm run package:mac

# Windows
npm run package:win

# Linux
npm run package:linux
```

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **electron-store** - Data persistence
- **date-fns** - Date utilities
- **recharts** - Chart visualization
- **framer-motion** - Animations
- **lucide-react** - Beautiful icons

## Project Structure

```
summer-checklist/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── notifications.ts
│   ├── renderer/          # React app
│   │   ├── components/
│   │   │   ├── views/
│   │   │   └── ...
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│   └── types/             # TypeScript definitions
├── presets/               # Preset activities database
└── package.json
```

## Usage

### Adding Activities
1. Click the "Add Activity" button in any view
2. Fill in the title, description, category, and tags
3. Save to add to your list

### Completing Activities
1. Click the circle icon next to an activity to mark it complete
2. Upload photos of your adventure
3. View it in the Timeline to see when you completed it

### Viewing Recaps
1. Go to the Recap view
2. Select your time period (week, month, or summer)
3. See your statistics, timeline graph, and photo grid
4. Export your recap to share with friends

### Notifications
1. Go to Settings
2. Enable notifications
3. Set your active hours
4. Receive random activity suggestions throughout the day

## Future Enhancements

- Cloud sync across devices
- Friend collaboration (shared activity lists)
- Video recap generation
- Advanced AI with OpenAI integration
- Weather-based suggestions
- Location-aware activities
- Social media sharing
- Mobile companion app

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ☀️ for an unforgettable summer
