# Mangalam HDPE Pipes - Product Landing Page

Single-page marketing site for a premium HDPE pipes and coils product line. This project is a static HTML/CSS/JS build with rich interactions, responsive layouts, and multiple content sections (product details, technical specs, features, FAQs, applications, and more).

## Features
- Sticky header with mobile navigation toggle and dropdown support
- Product image gallery with thumbnail selection and hover zoom preview
- Floating price bar that appears after the pricing card scrolls out of view
- Technical specs table and multi-section content blocks
- Continuous carousel for applications and testimonials
- Mobile manufacturing-process carousel with keyboard and swipe support
- FAQ accordion with inline email request validation
- Quote and datasheet modals with basic validation
- Responsive layouts for desktop, tablet, and mobile

## Tech Stack
- HTML5
- CSS3 (custom properties, responsive media queries)
- Vanilla JavaScript

## Project Structure
```
.
├── index.html
├── styles.css
├── script.js
└── assets/
	└── navIMG/
```

## Getting Started
No build step is required.

1. Open `index.html` in your browser, or
2. Run a local server (recommended for best asset loading):

```bash
# Option 1 (VS Code Live Server extension)
# Right-click index.html and choose "Open with Live Server"

# Option 2 (Python)
python -m http.server 5500
```

Then visit http://localhost:5500

## Usage Notes
- Forms are front-end only and use client-side validation plus alert messages.
- Downloads and contact actions are placeholders; wire them to real endpoints as needed.
- Most content is static and can be edited directly in `index.html`.

## Customization
- Update brand assets in `assets/` and `assets/navIMG/`.
- Modify colors and spacing in CSS custom properties in `styles.css`.
- Edit interactions in `script.js` (carousels, modals, floating bar, navigation).

## External Resources
- Fonts: Inter, Urbanist (Google Fonts), Vert Grotesk (cdnfonts.com)
- Icons and images are stored under `assets/`

## License
This project is for assignment/demo use. Add a license file if you plan to distribute it.
