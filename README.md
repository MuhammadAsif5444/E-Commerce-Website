# ShopNest

A modern, polished e-commerce storefront built with React, TypeScript, and Vite. ShopNest is designed to feel like a real online shopping experience: clean product discovery, smart deals, checkout flows, account management, seller tools, and an admin dashboard—all wrapped in a responsive, customer-friendly interface.

This project is a front-end commerce demo with realistic mock data, interactive shopping flows, and a developer-friendly structure that makes it easy to extend into a production-ready store.

## Overview

ShopNest brings together the core pieces of a full retail experience:

- Product browsing by category and subcategory
- Featured banners and time-sensitive deals
- Smart recommendations and best-seller sections
- Shopping cart, wishlist, and checkout experience
- Customer authentication and account area
- Seller dashboard for inventory and promotions
- Admin dashboard for products, coupons, banners, and store management
- AI-powered storefront assistant
- Review sentiment and rating insights

## Why this project stands out

The goal was to build more than a static landing page. This project feels like a real marketplace, with user flows that mirror how people shop online today.

Instead of a basic storefront, it includes the product journey users expect:

- discover products visually
- compare offers
- add items to cart
- apply coupons
- complete checkout
- track order confirmation
- manage seller and admin operations

It is especially useful as a UI prototype, portfolio project, or foundation for a larger commerce application.

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React
- Google Generative AI integration for the chatbot assistant

## Features

### Customer experience

- Hero carousel with promotional banners
- Category-based shopping experience
- Product cards with pricing, rating, discounts, and review counts
- Product details with variant selection and specs
- Wishlist and cart management
- Coupon-based checkout workflows
- Order confirmation page
- Responsive mobile-first layout

### Seller and admin operations

- Seller dashboard for inventory and listing management
- Admin tools for categories, coupons, banners, and product updates
- Review moderation context with sentiment analysis insights
- Real-time local state updates via browser storage

### UX and product polish

- Dark mode support
- Smooth transitions and modern card-based layouts
- Smart product recommendations based on shopping context
- AI assistant widget for shopping support

## Project structure

```bash
src/
├── components/
│   └── common/
├── context/
├── data/
├── pages/
├── types/
├── utils/
├── App.tsx
├── main.tsx
├── index.css
└── ...
```

## Getting started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root based on `.env.example`:

```bash
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
```

> The app uses the Gemini API for the storefront assistant. If you are only exploring the UI, the store still works without altering the core product experience.

### Run the app

```bash
npm run dev
```

The app will run on:

```bash
http://localhost:3000
```

### Production build

```bash
npm run build
```

### Lint / type check

```bash
npm run lint
```

## Available scripts

```bash
npm run dev       # start local frontend server
npm run build     # build for production
npm run preview   # preview production build
npm run lint      # run TypeScript type check
npm run clean     # remove build artifacts
```

## Notes

This is a demo commerce application with mock data stored in the browser, which makes it ideal for experimentation and UI prototyping. It is not wired to a real backend or payment provider out of the box.

If you want to turn this into a production-ready marketplace, the next logical steps would be:

- add a real backend API
- connect Stripe or similar payment processing
- persist products and orders in a database
- implement authentication with a secure user system
- add a proper admin and seller authorization layer

## Contributing

Contributions are welcome. If you want to improve the storefront, add real data flows, or expand the dashboard functionality, feel free to open a pull request or build on top of the existing structure.

## License

This project is currently distributed without a formal license. If you plan to use it for personal or commercial work, it is best to confirm the licensing terms with the original author before shipping it publicly.

## Final thought

ShopNest is built to feel like a modern e-commerce brand rather than a basic template. It balances product discovery, conversion-focused UX, and operational dashboards in a way that makes the experience feel genuinely human and usable.

If you are looking for a storefront that feels premium, structured, and ready for extension, this is a strong starting point.
