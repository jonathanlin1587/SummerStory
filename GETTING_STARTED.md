# Getting Started with Summer Activity Tracker

Welcome to your Summer Activity Tracker! This guide will help you get the app up and running.

## Quick Start

### Option 1: Using the start script (Recommended)
```bash
./start.sh
```

### Option 2: Using npm directly
```bash
npm run dev
```

The app will automatically open in a new window!

## First-Time Setup

When you first open the app, you'll see an empty activity list. Here's what to do:

### 1. Get Activity Suggestions
Click the **"Get Suggestions"** button (sparkle icon) to see AI-generated summer activity ideas. You can:
- Browse through 3 suggestions at a time
- Add any activity to your list with one click
- Refresh to get new suggestions
- We have 50+ preset activities to inspire you!

### 2. Add Your Own Activities
Click **"Add Activity"** to create custom activities:
- Enter a title (e.g., "Watch sunset at the beach")
- Add a description
- Choose a category (Outdoor, Creative, Food, Adventure, Relaxation, Social)
- Add tags for easy filtering

### 3. Complete Activities
- Click the circle icon next to any activity to mark it complete
- The app will record the completion date automatically

### 4. Upload Photos
When you complete an activity:
1. Mark it as complete
2. Click to edit the activity
3. Upload photos of your adventure
4. Add captions to remember the moment

## Exploring Different Views

### List View
Your default view - see all activities in a scrollable list with filters and search.

### Card View
Pinterest-style grid layout with photo previews - perfect for visual browsing.

### Kanban Board
Organize activities into To Do, In Progress, and Completed columns. Drag and drop to change status!

### Timeline
Calendar view showing when you completed activities. Click any date to see what you did that day.

### Recap
See your progress with:
- Statistics (completion rate, streaks, photo count)
- Timeline graphs showing activity over time
- Photo grid of all your memories
- Filter by week, month, or entire summer

## Setting Up Notifications

1. Go to **Settings** (bottom of sidebar)
2. Enable notifications
3. Set your active hours (e.g., 10 AM - 8 PM)
4. The app will send random activity suggestions during these hours

## Tips for an Amazing Summer

1. **Be Consistent**: Try to complete at least one activity per week
2. **Take Photos**: Document your adventures - they make great recaps!
3. **Mix Categories**: Balance outdoor adventures with creative projects and relaxation
4. **Use the Kanban Board**: Move activities to "In Progress" when you're planning them
5. **Check Your Recap**: Review your progress weekly to stay motivated

## Keyboard Shortcuts

- **Cmd/Ctrl + N**: Add new activity (coming soon)
- **Arrow Keys**: Navigate in photo gallery
- **Escape**: Close modals

## Troubleshooting

### App won't start?
Make sure all dependencies are installed:
```bash
npm install
```

### Photos not showing?
Photos are stored locally. Make sure the photo files haven't been moved or deleted.

### Notifications not working?
Check your system notification settings and ensure the app has permission to send notifications.

## Building for Production

When you're ready to create a standalone app:

```bash
# Build the app
npm run build

# Package for your platform
npm run package:mac    # macOS
npm run package:win    # Windows
npm run package:linux  # Linux
```

## Data Storage

Your data is stored locally using electron-store:
- **Activities**: Saved in JSON format
- **Settings**: User preferences
- **Photos**: Stored in your userData folder

No data is sent to the cloud unless you enable cloud sync (coming in a future update).

## Need Help?

Check out the README.md for more technical details or troubleshooting steps.

---

Have an amazing summer! 🌞🌴✨
