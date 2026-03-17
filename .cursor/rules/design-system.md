---
description: Golden Lotus UI/UX Design System. Auto-loaded for all frontend files.
globs: ["src/pages/**", "src/components/**", "src/admin/**"]
alwaysApply: false
---

## WORLD CLASS UI/UX DESIGN RULES
## Standard: $50,000+ premium restaurant website

## DESIGN PHILOSOPHY
You are a senior UI/UX designer with 10+ years experience designing for premium restaurants, luxury brands, and high-converting e-commerce platforms. You think like a designer first, developer second. Every pixel matters. Every interaction matters. Every color choice has a reason. Every spacing decision is intentional. Your goal: User looks at this website and thinks "This restaurant is premium, trustworthy, and delicious" within the first 3 seconds.

## GOLDEN LOTUS BRAND IDENTITY
Name: Golden Lotus
Personality: Modern, Premium, Warm, Trustworthy, Appetizing
Cuisine: Asian Fusion
Target Customer: 25-45 year olds, middle to upper income
Feeling to evoke: "I can't wait to eat here"

## TYPOGRAPHY
Headings font: Playfair Display (elegant, premium)
Body/UI font:  Inter (clean, readable, modern)

Font sizes:
  12px = labels, badges
  14px = secondary text
  16px = body text MINIMUM (prevents iOS zoom!)
  18px = large body
  20px = card titles
  24px = section subtitles
  30px = section titles
  36px = page titles
  48px = hero titles
  60px = mega headlines

Font weights:
  400 = regular body text
  500 = medium UI labels
  600 = semibold card titles
  700 = bold headings buttons
  800 = extrabold hero text

Line height:
  Headings: 1.1 to 1.2 (tight)
  Body: 1.5 to 1.6 (comfortable)
  UI: 1.4 (labels, buttons)

Letter spacing:
  Headings: -0.02em (premium feel)
  Body: 0 normal
  Labels: +0.05em
  ALL CAPS: +0.1em always

## SPACING (8px grid — always multiples of 4)
  4px  = tiny gaps
  8px  = icon gaps
  12px = tight padding
  16px = default padding
  24px = card padding
  32px = section gaps
  48px = large sections
  64px = page sections
  80px = hero padding
  96px = big section gaps

## BORDER RADIUS
  4px   = badges, tags
  8px   = inputs, small cards
  12px  = buttons, cards
  16px  = modals, large cards
  20px  = featured cards
  24px  = hero cards
  9999px = pills, avatars

## SHADOWS
  sm:  0 1px 2px rgba(0,0,0,0.05)
  md:  0 4px 6px rgba(0,0,0,0.07)
  lg:  0 10px 15px rgba(0,0,0,0.1)
  xl:  0 20px 25px rgba(0,0,0,0.1)
  2xl: 0 25px 50px rgba(0,0,0,0.15)
  Orange glow CTA: 0 4px 14px rgba(249,115,22,0.4)
  Card hover: 0 20px 40px rgba(0,0,0,0.12)

## BUTTON RULES
PRIMARY:
  Background: #F97316
  Text: white, semibold
  Padding: 12px 24px
  Border radius: 12px
  Shadow: 0 4px 14px rgba(249,115,22,0.4)
  Hover: #EA6C0A + more shadow
  Active: scale 0.98
  Disabled: opacity 50%
  Min height: 48px touch target
  Transition: all 200ms ease

SECONDARY:
  Background: transparent
  Border: 2px solid #F97316
  Text: #F97316 semibold
  Hover: background #FFF7ED

GHOST:
  Background: transparent
  Text: #374151
  Hover: background #F3F4F6

DANGER:
  Background: #DC2626
  Hover: #B91C1C

ICON BUTTON:
  Size: minimum 40x40px
  Always add aria-label

## INPUT FIELD RULES
Default:
  Border: 1px solid #E5E7EB
  Background: white
  Border radius: 10px
  Padding: 12px 16px
  Font size: 16px minimum
  Color: #111827
  Placeholder: #9CA3AF

Focus:
  Border: 2px solid #F97316
  Ring: 0 0 0 3px rgba(249,115,22,0.15)
  Outline: none

Error:
  Border: 2px solid #DC2626
  Ring: 0 0 0 3px rgba(220,38,38,0.15)

Success:
  Border: 2px solid #16A34A

Label:
  14px, weight 500, color #374151
  Margin bottom 6px

Error message:
  12px, color #DC2626
  Margin top 4px
  Show warning icon

## CARD RULES
MENU ITEM CARD:
  Background: white
  Border radius: 16px
  Shadow: 0 4px 6px rgba(0,0,0,0.07)
  Border: 1px solid #F3F4F6
  Image height: 200px, object-cover
  Image hover: scale 1.05, transition 400ms
  Title: Playfair Display, 18px, weight 600
  Description: 14px, #6B7280, 2 line clamp
  Price: Inter, 20px, bold, #F97316
  Add button: 40x40px round orange
  Card hover: translateY -4px, more shadow, 300ms

PROFILE/ORDER CARD:
  Border radius: 16px
  Border: 1px solid #E5E7EB
  Padding: 20px

ADMIN STAT CARD:
  Border radius: 16px
  Padding: 24px
  Left border: 4px solid accent color

## NAVBAR RULES
  Background: rgba(255,255,255,0.95)
  Backdrop blur: 8px
  Border bottom: 1px solid #F3F4F6
  Height: 64px desktop, 56px mobile
  Position: sticky top 0
  Z-index: 50
  Logo: Playfair Display, 22px bold, #111827
  Links: Inter 15px weight 500, #374151
  Link hover: #F97316, transition 150ms
  Mobile: slide in from right, dark overlay

## MODAL RULES
  Backdrop: rgba(0,0,0,0.6) blur 4px
  Card: white, rounded 24px
  Padding: 32px
  Shadow: 0 25px 50px rgba(0,0,0,0.25)
  Enter: fade + scale 0.95 to 1, 200ms ease-out
  Exit: fade + scale to 0.95, 150ms ease-in
  Mobile: bottom sheet, slide up, rounded top 24px

## TOAST RULES
  Position: top-right, 16px from edge
  Max width: 360px
  Border radius: 12px
  Auto dismiss: 4 seconds
  Hover: pause timer
  Success: white bg, left border 4px #16A34A, green checkmark
  Error: left border 4px #DC2626, red X icon
  Warning: left border 4px #D97706, amber warning icon
  Info: left border 4px #2563EB, blue info icon

## LOADING STATE RULES
  Skeleton: #F3F4F6 with shimmer animation
  Spinner: 20px inline, 40px full page, #F97316, 0.8s
  Button loading: spinner + "Loading..." text, keep same size
  Full page: center, logo + spinner, pulse animation

## PAGE LAYOUT RULES
HOMEPAGE HERO:
  Height: 100vh
  Dark overlay gradient on food image
  rgba(0,0,0,0.3) to rgba(0,0,0,0.6)
  H1: Playfair Display 60-72px white bold
  Subtitle: Inter 20px white/80
  CTA: orange button with arrow
  Scroll indicator: animated bounce at bottom

EVERY SECTION:
  Padding: 80px top bottom
  Max width: 1280px centered
  Eyebrow: uppercase orange small
  Heading: Playfair Display 3xl-4xl gray-900
  Subheading: Inter lg gray-500

MENU PAGE:
  Category tabs: sticky, pill shaped, orange active
  Grid: 4 cols desktop, 3 tablet, 2 mobile
  Gap: 24px

CHECKOUT PAGE:
  Max width: 1024px
  Left 60% form, Right 40% sticky summary
  Progress: connected line, orange filled = complete

PROFILE PAGE:
  Sidebar 240px left, content flex-1 right
  Active tab: orange bg/10, orange text, orange left border

## ANIMATION RULES
  All durations: 150ms to 400ms only
  Easing: ease-out entrances, ease-in exits
  Never animate more than 2 things at once
  Always respect prefers-reduced-motion

  Page transition: fade 200ms
  Modal open: scale + fade 200ms ease-out
  Modal close: scale + fade 150ms ease-in
  Card hover: lift + shadow 300ms
  Image hover: scale 400ms
  Button click: scale 0.97, 100ms
  Toast: slide from right 300ms
  Scroll animations: fade + slide up, stagger 100ms, once only

## RESPONSIVE RULES
  Mobile first always (375px → 768px → 1024px → 1280px)
  Single column on mobile
  Full width buttons on mobile
  Bottom sheets instead of modals on mobile
  Min touch target: 44x44px
  Min font size: 16px on mobile
  No hover-only interactions

## IMAGE RULES
  Always object-fit cover
  Fallback: #FFF7ED background with 🍽️ icon
  WebP format preferred
  Always lazy load below fold
  Always eager load hero images
  Alt text: always descriptive with dish name

## ICON RULES
  Library: Lucide React only
  Navigation: 20px
  Buttons: 16-18px
  Features: 24px
  Hero: 48px
  Stroke width: 1.5 (thin = premium)
  Never use emojis as functional icons

## CONTENT RULES
  Tone: warm, professional, appetizing
  Headlines: Playfair Display, sentence case, evocative
  Buttons: action-oriented "Order Now" not "Submit"
  Errors: human friendly "Oops!" not "Error 422"
  Empty states: always have icon + headline + description + button

## ACCESSIBILITY RULES
  Normal text contrast: minimum 4.5:1
  Large text contrast: minimum 3:1
  Focus indicator: 2px solid #F97316, offset 2px
  Never outline none without replacement
  Always alt text on images
  Always aria-label on icon buttons
  Always aria-live for dynamic content

## QUALITY CHECKLIST — before marking UI complete
VISUAL: colors match exactly, correct fonts, 8px grid, consistent radius, shadows correct, hover states, active states
FUNCTIONAL: loading state, error state, empty state, success feedback, form validation
RESPONSIVE: 375px mobile, 768px tablet, 1280px desktop, no horizontal scroll, 44px touch targets, 16px min font
ACCESSIBILITY: contrast passes, focus visible, alt texts, aria labels, keyboard navigable
PERFORMANCE: images optimized, animations smooth, no layout shift, lazy loading
