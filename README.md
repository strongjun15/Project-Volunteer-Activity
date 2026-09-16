# Vibe Coding for Middle Schoolers — Volunteer Mentoring Site

This is the website we built and used during a **volunteer program teaching vibe coding to middle school students**.
Many of the students had never written code before, so every part of the site was designed to let them experience coding with AI step by step, all the way from their first terminal command to deploying a real website of their own.

The materials are meant to be followed in the order below.

## Files

| File | Purpose |
|---|---|
| `index.html` | **Single source.** Contains all student and mentor content. Opens in student view by default |
| `index.html?mode=mentor` | The same file in mentor mode, showing 9 mentor notes and a MENTOR MODE badge |
| `student.html` / `mentor.html` | Redirects kept for old links (to `index.html` and `index.html?mode=mentor`) |
| `script.js` / `style.css` | Shared logic and styles |
| `supabase-config.js` | Supabase connection settings. Fill in the values to enable progress saving and the gallery |
| `supabase_setup.sql` | Script to paste into the Supabase SQL Editor to create tables and policies |
| `DEPLOY.md` | Step-by-step guide for connecting Supabase and deploying to Vercel (about 15 minutes) |

**No external libraries or build steps required.** Just double-click a file to open it in your browser. After editing, save and refresh to see your changes.

To update content, you only need to edit **`index.html`**. Anything written inside a `class="mentor-panel"` block is automatically hidden in the student view.

Progress (current tab and page), dark mode, and the student's CLAUDE.md draft are saved in localStorage, so nothing is lost on refresh.

## Session Flow

1. **Orientation:** Kick off the session with `OT_바이브코딩.pptx`
2. **Concept practice:** Use `mentoring_site.html` to explore the core ideas (Rule Lab → Side-by-Side Comparison → Write Your Own Rules)
3. **Hands-on build:** Use `study_site_full_guide.html` to build a real study website in 8 steps, from launching Claude Code in the terminal to writing CLAUDE.md, using Plan Mode, adding Hooks, connecting Supabase, and deploying to Vercel

## `study_site_full_guide.html` — Steps 1 to 8

| Step | What Students Do | Focus |
|---|---|---|
| 1 | Install Git → restart PowerShell → add Git to PATH → install Claude Code and the Superpowers plugin | Setup |
| 2 | Write a CLAUDE.md file (global rules vs. project rules) | Giving AI context |
| 3 | Design first with Plan Mode (`/plan`): the AI asks questions, then builds after approval | Planning |
| 4 | Review the result, give specific feedback, and add features one at a time | Build & review |
| 5 | Add a safety net with Hooks (automatically block exposed secret keys) | Safety |
| 6 | Connect Supabase via MCP and create real tables and data | Real data |
| 7 | Deploy the site for real with the Vercel CLI | Launch |
| 8 | Recap of everything learned + next challenges | Wrap-up |

Students choose a **subject** (Physics / Chemistry / Biology / Earth Science / Computer Science / Math / English) and a **site type** (Flashcards / Practice Quiz / Mistake Notebook / Study Planner + Timer / Vocabulary List). Based on that combination, the CLAUDE.md content, Plan Mode prompts, and Supabase tables and data are all filled in automatically. Steps 2, 3, 5, and 7 end with a short quiz to check understanding.

The file has two main screens:

- `#selectScreen`: Enter a name and pick a subject and site type
- `#guideScreen`: Steps 1 to 8, customized for the chosen combination

All content is managed by two data objects in the JavaScript, with detailed comments throughout the code.

```js
const SUBJECTS = { physics: {...}, chemistry: {...}, ... }  // Content per subject (cards / problems / tasks / ideas)
const TYPES    = { flashcard: {...}, quiz: {...}, ... }     // Prompts and DB table definitions per site type
```

**To add a new subject** → Add an entry to `SUBJECTS` and add a card to `<div class="subject-grid">`

**To add a new site type** → Add an entry to `TYPES` (including `dbTable` / `dbColumns`), add preview and DB prompt logic to the Step 6 branch inside `startGuide()` (`if (pickedType === ...)`), and add a card to `<div class="type-grid">`

Design tokens such as colors live in the `:root` CSS variables at the top of the file. When a subject is selected, JavaScript updates `--accent` and `--accent-light` to switch the theme color.

## Deployment (What Students Do in Step 7)

Students simply ask Claude Code to "deploy this with Vercel," and it handles everything from installing the CLI to logging in and deploying, producing a real `.vercel.app` URL. Preparing the required installs and account sign-ups ahead of time helps the session run smoothly.

## Working Together (Git)

This folder is initialized as a Git repository. To continue working as a team:

1. Share the whole folder as a zip file, or push it to a GitHub repository
2. To push to GitHub:
   ```bash
   git remote add origin <team repository URL>
   git push -u origin main
   ```
3. After that, commit and push your changes with `git add . && git commit -m "description" && git push`
4. To avoid conflicts, we recommend working on a separate branch per feature (e.g. `feature/add-new-subject`)

## Change History

Run `git log` to see the full history of work so far.
