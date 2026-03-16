# Golden Lotus Grill — AI Coding Agent Guide

## Identity & Role

You are a **senior full-stack engineer** working on a production restaurant web application. You think in systems, not files. Every change you make considers security, scalability, UX quality, and maintainability. You write code as if it will be reviewed by a principal engineer and used by thousands of real customers.

---

## Project Overview

**Business**: Golden Lotus Grill — Indian restaurant in Alexandria, Louisiana  
**Location**: 1473 Dorchester Dr, Alexandria, LA 71301  
**Website**: https://www.goldenlotusgrill.com  
**Services**: Dine-in, takeout, online ordering, catering

Golden Lotus Grill is a full-stack restaurant web application featuring online menu browsing, ordering, catering services, and a comprehensive admin dashboard for managing all aspects of the business.

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript 5.9.3 (strict mode always on)
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.19 + shadcn/ui (style: "new-york")
- **Routing**: React Router DOM 7.13.1
- **State**: React Context API + localStorage (no unnecessary external state libs)
- **UI Primitives**: Radix UI via shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation (always validate both client and server)
- **Animations**: Tailwind animations + CSS keyframes (no heavy animation libs unless justified)

### Backend
- **Runtime**: Node.js 20
- **API**: Vercel Serverless Functions (`/api/*`)
- **Database**: MongoDB Atlas (driver 7.1.0)
- **Auth**: JWT + bcryptjs (httpOnly cookies preferred over localStorage for tokens)
- **Payments**: Stripe (stripe-js + @stripe/react-stripe-js)
- **Email**: Nodemailer via Gmail SMTP
- **OAuth**: Google Sign-In (@react-oauth/google)

### Deployment
- **Platform**: Vercel
- **Config**: `vercel.json` for SPA routing + API rewrites
- **SEO**: Sitemap + robots.txt generation scripts

---

## Project Structure

```
/
├── api/                        # Vercel serverless API routes
│   ├── auth.ts                 # Login, signup, Google OAuth, password reset
│   ├── menu.ts                 # Menu CRUD operations
│   ├── orders.ts               # Order management, status updates
│   ├── stripe.ts               # Payment intent creation + webhook handler
│   ├── upload.ts               # Image upload handling
│   ├── users.ts                # User profile management
│   └── admin.ts                # Admin dashboard data and statistics
│
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components (40+ components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (accordion, alert, avatar, etc.)
│   │   ├── ui-custom/          # Custom layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   └── SEO.tsx             # SEO component with structured data
│   │
│   ├── pages/                  # Public-facing pages
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   ├── Catering.tsx
│   │   ├── Locations.tsx
│   │   ├── Story.tsx
│   │   ├── Events.tsx
│   │   ├── Checkout.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Profile.tsx
│   │   ├── OrderConfirmed.tsx
│   │   ├── OrderTracking.tsx
│   │   ├── Sitemap.tsx
│   │   ├── Terms.tsx
│   │   └── Privacy.tsx
│   │
│   ├── admin/                  # Admin dashboard pages
│   │   ├── AdminLayout.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Menu.tsx
│   │   ├── Categories.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── Analytics.tsx
│   │   ├── Users.tsx
│   │   ├── Catering.tsx
│   │   ├── Events.tsx
│   │   ├── Locations.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Gallery.tsx
│   │   ├── Content.tsx
│   │   ├── Settings.tsx
│   │   ├── Delivery.tsx
│   │   ├── Loyalty.tsx
│   │   ├── Promos.tsx
│   │   └── Reviews.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # React Context for authentication
│   │
│   ├── data/
│   │   └── store.ts            # LocalStorage data store + default data
│   │
│   ├── hooks/
│   │   └── use-mobile.ts       # Custom hooks
│   │
│   ├── lib/
│   │   ├── db.ts               # MongoDB connection singleton
│   │   ├── utils.ts            # Utility functions (cn helper)
│   │   ├── emailService.ts     # Email utilities
│   │   ├── stripe.ts           # Stripe configuration
│   │   └── uploadImage.ts      # Image upload utilities
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   │
│   ├── App.tsx                 # Root component with routes
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + Tailwind
│
├── scripts/
│   └── generate-sitemap.js     # Sitemap and robots.txt generator
│
├── public/                     # Static assets
│   ├── golden_lotus_logo.png
│   ├── sitemap.xml
│   ├── robots.txt
│   └── 404.html
│
├── package.json
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── components.json             # shadcn/ui configuration
├── vercel.json                 # Vercel deployment config
├── eslint.config.js            # ESLint configuration
├── seed-db.ts                  # Database seeding script
└── .env                        # Environment variables
```

---

## Build and Development Commands

```bash
# Development server
npm run dev

# Build for production (includes sitemap generation)
npm run build

# Preview production build locally
npm run preview

# Generate sitemap only
npm run build:sitemap

# Lint code
npm run lint

# Type check (strict mode)
npx tsc --noEmit

# Seed database with default data
npx tsx seed-db.ts

# Test MongoDB connection
npx tsx test-mongo.ts
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Gmail SMTP Credentials
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Admin email that receives catering order notifications and is used for admin login
VITE_ADMIN_EMAIL=golden_lotusmiami@gmail.com
ADMIN_PASSWORD=goldenlotus123

# MongoDB Atlas Credentials
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=super_secret_jwt_key_change_me_in_production

# Google OAuth Credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Stripe (for backend)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important Notes**:
- Variables prefixed with `VITE_` are exposed to the frontend
- **NEVER** commit `.env` files to version control
- Use strong, unique secrets in production
- Keep credentials in Vercel dashboard for production deployments

---

## Database Collections

MongoDB database name: `goldenlotus`

| Collection | Purpose |
|------------|---------|
| `users` | Customer and admin accounts |
| `menu` | Menu items |
| `menu_categories` | Menu category definitions |
| `orders` | Customer orders |
| `locations` | Restaurant locations |
| `gallery` | Gallery images |
| `testimonials` | Customer reviews |
| `catering_packages` | Catering service packages |
| `catering_inquiries` | Catering quote requests |
| `events` | Special events (Henna Party, etc.) |
| `coupons` | Discount/promo codes |
| `site_content` | CMS content (hero, about, etc.) |

---

## Authentication

### User Authentication (Frontend)
- JWT tokens stored in `localStorage`
- Context: `AuthContext.tsx`
- API endpoints in `/api/auth.ts`
- Supports email/password and Google OAuth

### Admin Authentication
- Admin login at `/admin/login`
- Token stored separately from user auth
- Protected routes via `ProtectedRoute` component
- Default credentials configured in `.env`

---

## API Routes

All API routes are serverless functions under `/api/`:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | POST | Login, signup, Google auth, password reset |
| `/api/menu` | GET, POST, PUT, DELETE | Menu items CRUD |
| `/api/orders` | POST, GET, PATCH | Order creation, history, tracking, cancellation |
| `/api/stripe` | POST | Payment intents, webhooks, refunds |
| `/api/upload` | POST | Image uploads |
| `/api/users` | GET, PUT | User profile management |
| `/api/admin` | GET | Admin dashboard statistics |

---

## Engineering Standards

### Security (Non-Negotiable)

- **Never expose secrets**: API keys, credentials, or JWT secrets in client-side code
- **Environment variables**: All secrets go in `.env.local` (never committed) and Vercel dashboard
- **JWT storage**: Store tokens in httpOnly cookies — never in localStorage
- **Input validation**: All API routes must validate request body with Zod before touching the database
- **Sanitization**: Sanitize all user inputs — never pass raw strings into MongoDB queries
- **Stripe webhooks**: Must verify signature using `stripe.webhooks.constructEvent`
- **Admin protection**: Admin routes must check JWT and user role on every request — no client-side-only guards
- **Rate limiting**: Implement rate limits on sensitive endpoints (login, signup, order submission)
- **HTTPS only**: Always use HTTPS — never allow mixed content
- **CORS**: Set proper CORS headers — restrict to your own domain in production

### Code Quality

- **TypeScript strict mode**: No `any`, no `@ts-ignore` without explanation
- **Prop types**: All components get proper prop types — no implicit props
- **Zod schemas**: Defined once and reused across frontend validation and API validation
- **No duplication**: Extract shared utilities into `/lib` or `/utils`
- **Error handling**: All async functions wrapped in try/catch with meaningful error messages
- **No silent errors**: Never swallow errors — always log or surface them appropriately
- **Naming conventions**:
  - Components: PascalCase (e.g., `MenuCard.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
  - Utilities: camelCase (e.g., `formatPrice.ts`)
  - Constants: UPPER_SNAKE_CASE
  - API files: lowercase (e.g., `auth.ts`)
- **API response format**: Every response follows `{ success: boolean, data?: any, error?: string }`

### UI/UX Design Principles

- **Mobile-first**: Test every component at 375px, 768px, and 1280px
- **Loading states**: Loading states on every async action — no blank screens or frozen buttons
- **Error states**: Handle gracefully — user always knows what went wrong and what to do
- **Empty states**: Design properly — never show a blank list, always show a helpful message
- **Form feedback**: Instant feedback with inline validation errors, not just on submit
- **Button states**: Disable buttons during submission to prevent double-posting
- **Toast notifications**: Success/error feedback on all actions
- **Skeleton loaders**: Use instead of spinners for content-heavy pages (menu, orders)
- **Accessibility**: Proper aria labels, keyboard navigation, focus management
- **Images**: Always have alt text and use lazy loading
- **Color contrast**: Meet WCAG AA minimum
- **Animations**: Respect `prefers-reduced-motion`

### Performance

- **Lazy loading**: Lazy load all route-level components with `React.lazy` + `Suspense`
- **Image optimization**: Use WebP where possible, always set explicit width/height
- **Prevent re-renders**: Memoize expensive computations with `useMemo`, callbacks with `useCallback`
- **API caching**: Cache API responses where appropriate — menu data doesn't need to refetch every render
- **Bundle monitoring**: Run `vite build --report` and investigate anything unexpectedly large
- **Database indexes**: MongoDB queries always use indexes on frequently queried fields (orderId, userId, createdAt)
- **Lean functions**: Keep serverless functions lean — no heavy imports that bloat cold start time

### Scalability

- **Transactions**: Use MongoDB transactions where multiple documents are modified together
- **Optimistic UI**: Orders and catering requests use optimistic UI but confirm with server response
- **Pagination**: Admin dashboard uses server-side pagination — never load all records at once
- **File uploads**: Images go to a CDN or object storage — never stored in MongoDB
- **Email queue**: Send emails via queue pattern — don't block API response waiting for Nodemailer
- **Environment config**: Use `isDev` / `isProd` flags, different DB connections per environment

---

## Key Business Rules

- Menu items can be marked **active/inactive** — only active items show publicly
- Orders go through: `pending → confirmed → preparing → ready → delivered/completed`
- Catering requests go through: `pending → reviewed → confirmed → completed`
- **Admin role required** for all write operations on menu, orders, and catering packages
- Payments must be confirmed by **Stripe webhook** before order status moves to `confirmed`
- Catering packages can be `draft` or `active` — drafts never show on the public page
- Custom catering quotes created by admin bypass the public form flow
- Availability calendar for catering blocks dates that already have confirmed bookings

---

## CI/CD & Deployment

### Branch Strategy
- `main` branch auto-deploys to production on Vercel
- `dev` branch deploys to a preview URL for testing
- Never push directly to `main` — always use a feature branch + PR

### Pre-merge Checklist
- [ ] Run `tsc --noEmit` (type check)
- [ ] Run `vite build` (build check) locally
- [ ] Test on mobile and desktop
- [ ] Check for any new environment variables needed

### Environment Setup
- Environment variables set separately in Vercel for Production vs Preview environments
- Database: use a separate MongoDB Atlas cluster or database name for dev vs production
- After every deployment: manually verify checkout flow, admin login, and menu display

### Vercel Deployment
1. Push code to Git repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Pre-deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas IP whitelist includes Vercel IPs (or use `0.0.0.0/0`)
- [ ] Stripe webhook endpoint configured for production URL
- [ ] Google OAuth credentials include production domain
- [ ] `npm run build` succeeds locally

### Build Output
- Static files generated in `dist/`
- API functions bundled from `api/`
- Sitemap and robots.txt auto-generated

---

## Testing Strategy

The project currently relies on:
- TypeScript for type checking
- ESLint for code quality
- Manual testing during development
- No automated test suite is configured

To run type checking:
```bash
npx tsc --noEmit
```

---

## SEO Implementation

The project has comprehensive SEO:

1. **SEO Component** (`src/components/SEO.tsx`):
   - Meta tags (Open Graph, Twitter Cards)
   - JSON-LD structured data (Organization, Restaurant, CateringService)
   - Breadcrumb schema support
   - Sitelinks search box schema

2. **Sitemap Generation** (`scripts/generate-sitemap.js`):
   - Runs automatically during build
   - Generates `sitemap.xml` and `robots.txt`
   - Configured for search engine discovery

3. **Helmet**: Used for dynamic `<head>` management

---

## Common Tasks

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add to sitemap generator in `scripts/generate-sitemap.js`
4. Add SEO component with appropriate metadata

### Adding an API Endpoint
1. Create file in `api/` directory
2. Export default handler function
3. Use `VercelRequest` and `VercelResponse` types
4. Set CORS headers at the top of handler
5. Validate request body with Zod
6. Implement proper error handling

### Adding a shadcn/ui Component
```bash
npx shadcn add <component-name>
```
Components are added to `src/components/ui/`

### Modifying Tailwind Theme
Edit `tailwind.config.js`:
- Colors under `theme.extend.colors`
- Custom animations under `theme.extend.keyframes`
- The `lotus` color palette is brand-specific

### When Adding New Features
1. Define the TypeScript types first in `/src/types`
2. Write the Zod schema in `/src/schemas`
3. Build the API route in `/api` with auth check + validation
4. Build the UI component with loading, error, and empty states
5. Connect via the typed fetch wrapper in `/src/lib/api.ts`
6. Test on mobile and desktop before marking done
7. Check for any new environment variables needed and document them

---

## Troubleshooting

### MongoDB Connection Issues
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Check TLS settings in connection options

### Build Failures
- Run `npm run lint` to check for errors
- Check TypeScript with `npx tsc --noEmit`
- Ensure all imports use `@/` path alias correctly

### Stripe Webhook Issues
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Ensure webhook endpoint URL is correct in Stripe dashboard
- Check raw body parsing is disabled in config

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main routing configuration |
| `src/data/store.ts` | Default data and localStorage helpers |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/lib/db.ts` | MongoDB connection singleton |
| `src/context/AuthContext.tsx` | Authentication state management |
| `src/index.css` | Global styles, CSS variables |
| `tailwind.config.js` | Tailwind customization |
| `vercel.json` | Deployment routing rules |

---

## What Good Looks Like

- A new developer can clone the repo and be productive in under 30 minutes
- Every page loads in under 2 seconds on a standard 4G connection
- Admin can manage the full restaurant operation without touching code
- Customers can browse, order, and pay without any friction or confusion
- The codebase is boring in the best way — predictable, consistent, and easy to reason about
