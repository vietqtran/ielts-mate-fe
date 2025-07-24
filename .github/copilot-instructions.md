# About Project

- This project is a web application designed to help users prepare for the IELTS exam. It provides various resources, including practice tests, vocabulary lists, and tips for each section of the exam.
- This platform will mainly focus on Reading and Listening skills, with a user-friendly interface that allows users to easily navigate through different sections and access the resources they need.
- The application is built using modern web technologies, including React, TypeScript, ShadcnUI, and Tailwind CSS, ensuring a responsive and accessible user experience.
- This project uses mainly Tailwind CSS for styling, leveraging its utility-first approach to create a consistent and efficient design system.

# Code Architecture:

- The code is organized into several components, each responsible for a specific part of the user interface.
- The code should be easy to read and maintain, with clear separation of concerns.

# UI

- The UI will be built using Shadcn UI components.
- The UI should be responsive across all devices and accessible.
- The UI should follow best practices for user experience, including clear navigation and intuitive design.

# Main Brand Color Palette (OKLCH, via CSS Variables)

Always use the following color palette as the primary design system colors for all UI design, code generation, and Tailwind/React/HTML/CSS suggestions, unless otherwise instructed.

When generating any color references (including Tailwind classes, inline styles, or CSS custom properties), prefer these variables and their OKLCH values in Color Palette section below.

## Color Palette (main themed colors for IELTS Mate)

:root {
--color-tekhelet-100: oklch(0.19 0.04 286.49);
--color-tekhelet-200: oklch(0.23 0.08 297.36);
--color-tekhelet-300: oklch(0.28 0.11 298.93);
--color-tekhelet-400: oklch(0.33 0.15 297.47);
--color-tekhelet-500: oklch(0.39 0.19 299.53);
--color-tekhelet-600: oklch(0.49 0.25 299.94);
--color-tekhelet-700: oklch(0.67 0.17 292.64);
--color-tekhelet-800: oklch(0.80 0.12 295.11);
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
--color-selective-yellow-400: oklch(0.75 0.27 84.10);
--color-selective-yellow-500: oklch(0.91 0.22 84.22);
--color-selective-yellow-600: oklch(0.94 0.17 86.07);
--color-selective-yellow-700: oklch(0.96 0.12 88.56);
--color-selective-yellow-800: oklch(0.98 0.07 90.06);
--color-selective-yellow-900: oklch(0.99 0.03 94.67);

--color-tangerine-100: oklch(0.22 0.13 63.36);
--color-tangerine-200: oklch(0.38 0.21 62.61);
--color-tangerine-300: oklch(0.54 0.25 65.60);
--color-tangerine-400: oklch(0.69 0.23 70.26);
--color-tangerine-500: oklch(0.84 0.22 72.80);
--color-tangerine-600: oklch(0.89 0.18 79.53);
--color-tangerine-700: oklch(0.93 0.13 83.38);
--color-tangerine-800: oklch(0.97 0.08 87.60);
--color-tangerine-900: oklch(0.99 0.04 92.19);

--color-persimmon-100: oklch(0.17 0.12 37.56);
--color-persimmon-200: oklch(0.32 0.22 40.22);
--color-persimmon-300: oklch(0.47 0.27 42.14);
--color-persimmon-400: oklch(0.62 0.26 43.94);
--color-persimmon-500: oklch(0.77 0.27 44.96);
--color-persimmon-600: oklch(0.84 0.19 52.31);
--color-persimmon-700: oklch(0.90 0.12 61.86);
--color-persimmon-800: oklch(0.95 0.07 70.25);
--color-persimmon-900: oklch(0.98 0.03 83.21);
}

**Guidelines:**

- Treat these CSS variables as the source of truth for all UI/UX, Tailwind, and CSS color output.
- These colors are configured in the Tailwind CSS new configuration file (globals.css), so you can use them directly in Tailwind classes, eg: `bg-tekhelet-500`, `text-medium-slate-blue-300`, etc.
- Use constrast colors for text and backgrounds, ensuring readability and accessibility. You can use color usage like below:
  App background: --color-tekhelet-900 or --color-medium-slate-blue-900: Both are very light, almost white; ideal for clean backgrounds.

  Card/Section BG: --color-tekhelet-100 or --color-medium-slate-blue-100: Subtle, slightly tinted panels for depth.

  Primary text: --color-tekhelet-700 or --color-medium-slate-blue-700: Deep, highly readable against very light backgrounds.

  Secondary text: --color-tekhelet-500 or --color-medium-slate-blue-500: For muted info, labels, helper text.

  Links/Highlight: --color-medium-slate-blue-500: Pops on light BG, feels lively but readable.

  Primary button: --color-selective-yellow-500: Strong call-to-action yellow.

  Button text: --color-tekhelet-900: Dark text for excellent contrast on yellow button.

  Warning/Alert: --color-persimmon-500 or red color: Noticeable warm for errors or important alerts.

  Border/Divider: --color-tekhelet-200: Subtle, not distracting but enough separation.

  Correct text: use Tailwind's default green colors

- For text colors, do not use too faded colors, always ensure sufficient contrast against the background.
- Do not use inline CSS styles for colors unless explicitly requested, only use Tailwind classes.
- When a design needs a color, select from this palette using the closest semantic match.

**Do not use hardcoded hex or RGB colors unless directly instructed.**
