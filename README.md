# FocusFlow

FocusFlow is a beginner-friendly student productivity dashboard built with HTML, CSS, and vanilla JavaScript. It helps you track tasks, see study progress, and run a 25-minute Pomodoro focus session — all in the browser, with no account, server, or API keys.

## Features

- **Task management:** add a title, category, and priority; mark tasks complete; delete tasks
- **Dashboard:** total, completed, and pending counts plus a completion progress bar
- **Filters:** view All, Pending, or Completed tasks
- **Pomodoro timer:** 25-minute countdown with Start, Pause, and Reset
- **Light and dark mode:** preference is remembered on this device
- **LocalStorage:** tasks and theme restore after a refresh

## How to run locally

No install steps and no backend are required.

1. Download or clone this project.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, or Safari).
   - In File Explorer, double-click `index.html`, or
   - drag the file into a browser window, or
   - right-click the file and choose **Open with** your browser.
3. Start adding tasks and using the timer.

Optional: if you already use a simple local server, you can serve the folder and visit the local URL. That is not required.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and accessible labels |
| `style.css` | Layout, theming, and responsive styles |
| `script.js` | Tasks, filters, dashboard stats, timer, and LocalStorage |

## Using the app

1. Type a task title, choose a category and priority, then click **Add task** or press Enter.
2. Use the checkboxes to complete tasks and **Delete** to remove them.
3. Filter the list with **All**, **Pending**, or **Completed**.
4. Click **Start** on the Pomodoro card to begin a 25-minute focus block. Use **Pause** and **Reset** as needed.
5. Use the header button to switch between light and dark mode.

Data stays in your browser. Clearing site data for this page will remove saved tasks and theme.
