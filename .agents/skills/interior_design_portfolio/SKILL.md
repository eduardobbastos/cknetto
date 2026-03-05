---
name: interior_design_portfolio
description: Skill for creating modern, high-end interior design portfolio websites with innovative animations and effects.
---

# Interior Design Portfolio Expert Skill

This skill provide instructions for creating a premium interior design portfolio website with dynamic content and high-end visual effects.

## Design Philosophy
- **Minimalism & Elegance**: Sophisticated dark modes (`#0F0F0F`), gold/brass accents (`#C5A059`), and premium typography (Montserrat for body, Playfair Display for titles).
- **Brand Identity**: Logo typography should be stacked (e.g., NAME in white, CATEGORY in primary color with high tracking) for a boutique feel.
- **Micro-animations**: Interactive elements should feel alive using a custom reactive cursor and smooth hover reveals.

## Technical Requirements
- **Structure**: Semantic HTML5 with high emphasis on visual hierarchy.
- **Dynamic Content**: Sync projects from Google Sheets using CSV export. Implement auto-conversion for Google Drive image links to direct render links.
- **Effects**:
    - **Hero Puzzle Reveal**: A mosaic entry effect where image pieces fade and scale into place.
    - **Project Carousel**: Click-driven navigation with fade-in/out transitions between views.
    - **Split-View Modal**: Side-by-side layout for expanded projects (Description on left, Image on right).
- **Mobile First**: Full responsiveness with a side-reveal hamburger menu and adaptive grid counts.
- **SEO & Social Share**: 
    - Full optimization for Google (Title/Description).
    - WhatsApp/Instagram preview (Open Graph tags).
    - Professional social preview images.

## Implementation Checklist
1. **Design System**: Set CSS variables for colors, transitions, and glassmorphism tokens.
2. **Hero Animation**: Build a grid-based puzzle reveal for the main hero image.
3. **Dynamic Data**: Setup `fetch` logic for Google Sheets and CSV parsing with field-quote handling.
4. **Custom Cursor**: Implement a custom dot/ring cursor that reacts to hoverable elements.
5. **Project Carousel**: Build a carousel that adjusts card count based on screen width (3 vs 1).
6. **Responsive Navigation**: Create a persistent header that adds background on scroll and a mobile-friendly slide-out menu.
7. **Performance**: Use CSS `will-change` and optimized image URLs for buttery smooth interactions.
