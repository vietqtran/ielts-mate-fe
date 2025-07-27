# IELTS Mate Web Application

A modern web application to help users prepare for the IELTS exam.  
Built for usability, accessibility, and effective IELTS skill-building.

---

## 1. Project Overview

- **Goal:** Provide comprehensive IELTS preparation, focused on Reading and Listening.
- **Key Features:** Practice tests, vocabulary lists, skill-specific tips, and a user-friendly interface.
- **Tech Stack:**
  - **Frontend:** React, TypeScript, ShadcnUI, Tailwind CSS
  - **Styling:** Tailwind CSS with a custom OKLCH-based color palette

---

## 2. Code Architecture

- Components are **modular** and separated by concern.
- **Easy to maintain:** Clear file/folder structure, readable code.
- **Responsibility separation:** Each component handles a distinct UI feature or logic unit.

---

## 3. UI & UX Guidelines

### 3.1. General Principles

- **Use Shadcn UI** for all components
- **Fully responsive:** Works on all devices
- **Accessible:** Keyboard navigation, strong color contrast
- **User-friendly:** Clear navigation and consistent layout

### 3.2. Brand Color Palette

- **Always use these CSS variables for color:**

```css
:root {
  --color-tekhelet-100: oklch(0.19 0.04 286.49);
  --color-tekhelet-200: oklch(0.23 0.08 297.36);
  --color-tekhelet-300: oklch(0.28 0.11 298.93);
  --color-tekhelet-400: oklch(0.33 0.15 297.47);
  --color-tekhelet-500: oklch(0.39 0.19 299.53);
  --color-tekhelet-600: oklch(0.49 0.25 299.94);
  --color-tekhelet-700: oklch(0.67 0.17 292.64);
  --color-tekhelet-800: oklch(0.8 0.12 295.11);
  --color-tekhelet-900: oklch(0.93 0.06 293.99);

  --color-medium-slate-blue-100: oklch(0.15 0.09 289.41);
  --color-medium-slate-blue-200: oklch(0.24 0.17 293.56);
  --color-medium-slate-blue-300: oklch(0.33 0.24 297.11);
  --color-medium-slate-blue-400: oklch(0.48 0.24 296.26);
  --color-medium-slate-blue-500: oklch(0.68 0.19 292.41);
  --color-medium-slate-blue-600: oklch(0.77 0.16 291.64);
  --color-medium-slate-blue-700: oklch(0.85 0.12 292.34);
  --color-medium-slate-blue-800: oklch(0.91 0.09 291.92);
  --color-medium-slate-blue-900: oklch(0.97 0.05 291.85);

  --color-selective-yellow-100: oklch(0.26 0.12 80.73);
  --color-selective-yellow-200: oklch(0.42 0.21 81.01);
  --color-selective-yellow-300: oklch(0.59 0.26 83.12);
  --color-selective-yellow-400: oklch(0.75 0.27 84.1);
  --color-selective-yellow-500: oklch(0.91 0.22 84.22);
  --color-selective-yellow-600: oklch(0.94 0.17 86.07);
  --color-selective-yellow-700: oklch(0.96 0.12 88.56);
  --color-selective-yellow-800: oklch(0.98 0.07 90.06);
  --color-selective-yellow-900: oklch(0.99 0.03 94.67);

  --color-tangerine-100: oklch(0.22 0.13 63.36);
  --color-tangerine-200: oklch(0.38 0.21 62.61);
  --color-tangerine-300: oklch(0.54 0.25 65.6);
  --color-tangerine-400: oklch(0.69 0.23 70.26);
  --color-tangerine-500: oklch(0.84 0.22 72.8);
  --color-tangerine-600: oklch(0.89 0.18 79.53);
  --color-tangerine-700: oklch(0.93 0.13 83.38);
  --color-tangerine-800: oklch(0.97 0.08 87.6);
  --color-tangerine-900: oklch(0.99 0.04 92.19);

  --color-persimmon-100: oklch(0.17 0.12 37.56);
  --color-persimmon-200: oklch(0.32 0.22 40.22);
  --color-persimmon-300: oklch(0.47 0.27 42.14);
  --color-persimmon-400: oklch(0.62 0.26 43.94);
  --color-persimmon-500: oklch(0.77 0.27 44.96);
  --color-persimmon-600: oklch(0.84 0.19 52.31);
  --color-persimmon-700: oklch(0.9 0.12 61.86);
  --color-persimmon-800: oklch(0.95 0.07 70.25);
  --color-persimmon-900: oklch(0.98 0.03 83.21);
}
```

- Color Usage Reference:

  - App background: Use bg-white
  - Card/Section background: --color-medium-slate-blue-900 or white
  - Primary text: --color-tekhelet-400 or --color-medium-slate-blue-400
  - Secondary text: --color-tekhelet-500 or --color-medium-slate-blue-500
  - Links/Highlight: --color-medium-slate-blue-300 or --color-tekhelet-300
  - Primary button: --color-selective-yellow-400 (text: --color-tekhelet-300 or 400)
  - Warning/Alert: --color-persimmon-300
  - Border/Divider: --color-tekhelet-900
  - Success/Correct: Use Tailwind’s default green scale.

> Never use faded text or inaccessible contrast. Always meet accessibility standards.

### 3.3. Glassmorphism (Aero Effect)

- Apply a glassmorphism effect to all main content surfaces (cards, panels, modals, navigation). Use:
  - Semi-transparent backgrounds (bg-white/60, bg-tekhelet-100/60)
  - Backdrop blur (backdrop-blur-md or backdrop-blur-lg)
  - Subtle borders and soft shadows (border, shadow-xl)
  - Rounded corners (rounded-2xl)

- Text must remain clear and accessible over blurred backgrounds.
Example:

```jsx
<div className="bg-tekhelet-100/70 backdrop-blur-lg border border-tekhelet-200 rounded-2xl shadow-xl p-6">
  {/* Content */}
</div>
```

### 3.4. Styling & Component Rules

- Tailwind Only: Use Tailwind classes for all color and effect styling.
- No inline CSS for colors unless absolutely necessary.
- Always map every color/effect to the palette and glassmorphism instructions above.
- When unsure of color, use the nearest semantic match from the palette.

### 4. Summary Checklist

- Use ONLY the provided OKLCH color palette for all design.
- All content surfaces should use a gentle glassmorphism effect.
- All styling should use Tailwind classes.
- Ensure accessibility and responsive design at every step.
