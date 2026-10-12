Yes. For Claude Code / Claude.ai, I recommend giving it one strong master prompt that tells it to actually build the project rather than merely describe it.

You can paste the following as the initial project prompt.

MASTER DEVELOPMENT PROMPT — NEEDX

You are the lead software architect, senior full-stack engineer, UI/UX engineer, security engineer, QA engineer, and DevOps engineer responsible for building a production-quality web application called NEEDX.

Do not merely explain the architecture. Actually implement the application in the repository.

The goal is to build a modern, responsive, installable PWA marketplace where a person can say what they need, and other people or businesses can provide it.

1. PRODUCT CONCEPT

NEEDX is a need-first marketplace.

A user should be able to write:

"I need a projector for 2 days in Gurgaon under ₹3000."

The platform understands the requirement and helps the user find people/businesses that can provide it.

The transaction can be:

Buy
Rent
Borrow
Hire
Request a quote
Exchange
Donate

The key product philosophy is:

Do not force the user to understand marketplace categories. Let the user describe what they need naturally.

Primary CTA:

What do you need?

2. IMPORTANT TECHNOLOGY REQUIREMENTS

Use exactly this architecture unless there is a strong technical reason to change something.

Frontend
Next.js 18
React
TypeScript
App Router
/src/app
Tailwind CSS
shadcn/ui
Radix UI
Lucide icons
React Hook Form
Zod
TanStack Query
Zustand where client state is actually required
Backend
Node.js
TypeScript
NestJS
REST API
Socket.IO for realtime messaging
Database
MongoDB
MongoDB Atlas compatible
Mongoose
MongoDB geospatial indexes
MongoDB Atlas Search where appropriate
PWA

The website must be a proper installable Progressive Web App.

Implement:

Web App Manifest
Service Worker
Installability
App icons
Splash/theme configuration
Offline app shell
Install prompt
Browser feature detection
Web Push notification architecture
PWA shortcuts where supported

The application must remain a normal SEO-friendly website when not installed.

3. PROJECT ARCHITECTURE

Use a monorepo.

Recommended structure:

needx/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── services/
│   │       ├── stores/
│   │       ├── types/
│   │       └── styles/
│   │
│   └── api/
│       └── src/
│           ├── modules/
│           ├── common/
│           ├── config/
│           ├── database/
│           ├── guards/
│           ├── middleware/
│           └── main.ts/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   └── config/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md


If the repository already has a structure, inspect it first and adapt instead of unnecessarily destroying existing work.

4. BEFORE CODING

First inspect the repository.

Determine:

Existing files
Existing package manager
Existing dependencies
Existing Next.js version
Existing backend
Existing database configuration
Existing environment variables
Existing UI components
Existing authentication
Existing tests

Do not overwrite working code without understanding it.

Then create or update:

README.md
ARCHITECTURE.md
ENVIRONMENT.md


Keep documentation synchronized with implementation.

5. FRONTEND ROUTES

Implement these routes.

Public
/
 /explore
 /search
 /needs
 /needs/[id]
 /listings
 /listings/[id]
 /providers/[id]
 /categories/[slug]
 /how-it-works
 /about
 /contact
 /terms
 /privacy

Authentication
/login
/register
/forgot-password
/verify

User Dashboard
/dashboard
/dashboard/needs
/dashboard/needs/[id]
/dashboard/listings
/dashboard/orders
/dashboard/rentals
/dashboard/messages
/dashboard/favorites
/dashboard/notifications
/dashboard/profile
/dashboard/settings

Provider
/provider
/provider/requests
/provider/offers
/provider/listings
/provider/orders
/provider/messages
/provider/analytics
/provider/settings

Admin
/admin
/admin/users
/admin/providers
/admin/needs
/admin/listings
/admin/orders
/admin/payments
/admin/categories
/admin/reports
/admin/disputes
/admin/moderation
/admin/reviews
/admin/notifications
/admin/settings


Protect authenticated and administrative routes correctly.

6. HOMEPAGE

Build a premium, modern marketplace homepage.

The first viewport should strongly emphasize:

What do you need?

Example:

What do you need?

┌──────────────────────────────────────────┐
│ I need a camera for this weekend...      │
└──────────────────────────────────────────┘

[Buy] [Rent] [Borrow] [Hire]

             [Find what I need]


Below it:

Popular categories
Nearby needs
Recommended providers
Popular listings
How it works
Trust/safety section
Provider CTA
Footer

The design must feel like a modern 2026 marketplace product.

Do NOT create a generic Bootstrap-looking website.

7. UI/UX DESIGN SYSTEM

Use:

Tailwind
shadcn/ui
Radix primitives
Lucide icons

Design characteristics:

Clean
Premium
Minimal
Spacious
Responsive
Accessible
Fast
Mobile-first
Rounded cards
Subtle shadows
Strong typography
Excellent empty states
Skeleton loading
Toast notifications
Smooth transitions

Do not overuse gradients.

Do not use excessive animations.

Use animation only where it improves UX.

Support:

Light mode
Dark mode
System theme

Create reusable design tokens.

8. MOBILE UX

Mobile is extremely important.

The website must feel like a real mobile application.

Mobile navigation:

Home
Explore
+ Need
Messages
Profile


The + Need action should be visually prominent.

Use:

Bottom sheets
Drawers
Sticky CTAs
Swipe-friendly cards
Large touch targets
Mobile-friendly forms
Responsive filters
Mobile search
Camera/file upload
Location selection
9. NEED CREATION

This is the most important workflow.

The user should be able to enter natural language.

Example:

I need a projector for 2 days in Gurgaon under ₹3000.

The UI should convert this into structured information.

Display:

We understood:

Projector
Rent
2 days
Gurgaon
Budget ₹3,000

[Edit]
[Post Need]


Allow users to manually change:

Category
Transaction mode
Budget
Quantity
Date
Duration
Location
Requirements
Description

Do not make AI mandatory for basic functionality.

The platform must still work if AI is unavailable.

10. NEED MODEL

Implement a Mongoose model with fields similar to:

{
  userId: ObjectId,

  title: string,
  description: string,

  categoryId: ObjectId,

  modes: [
    "BUY",
    "RENT",
    "BORROW",
    "HIRE",
    "EXCHANGE",
    "DONATE"
  ],

  budget: {
    min?: number,
    max?: number,
    currency: string
  },

  quantity?: number,

  dateRange?: {
    start?: Date,
    end?: Date
  },

  location: {
    type: "Point",
    coordinates: [number, number]
  },

  attributes: Record<string, unknown>,

  status:
    "DRAFT" |
    "ACTIVE" |
    "MATCHING" |
    "FULFILLED" |
    "EXPIRED" |
    "CANCELLED",

  createdAt: Date,
  updatedAt: Date
}


Create appropriate indexes.

11. LISTING MODEL

Implement:

{
  providerId: ObjectId,

  categoryId: ObjectId,

  title: string,
  description: string,

  type:
    "PRODUCT" |
    "SERVICE" |
    "RENTAL",

  modes: [
    "BUY",
    "RENT",
    "BORROW",
    "HIRE"
  ],

  price: {
    amount: number,
    currency: string,
    unit?: "ITEM" | "DAY" | "HOUR" | "SERVICE"
  },

  deposit?: number,

  quantity: number,

  condition?: string,

  images: string[],

  location: {
    type: "Point",
    coordinates: [number, number]
  },

  attributes: Record<string, unknown>,

  status:
    "DRAFT" |
    "ACTIVE" |
    "PAUSED" |
    "SOLD" |
    "ARCHIVED"
}

12. PROVIDER SYSTEM

A provider can be:

Individual
Professional
Business

Provider profile:

Name
Photo/logo
Description
Verification
Rating
Completed transactions
Response rate
Location
Services
Listings
Reviews


Display trust badges:

✓ Verified
⚡ Fast responder
🏆 Top provider


Only display badges when the underlying criteria are actually met.

13. SEARCH

Implement marketplace search.

Support:

Keyword search
Fuzzy search
Category
Price
Distance
Transaction mode
Availability
Rating
Provider verification
Date
Delivery
Condition

Use MongoDB Atlas Search if available.

Do not make the application dependent on Atlas Search for basic operation.

14. GEOLOCATION

Use MongoDB 2dsphere.

Users can search:

Near me
Within 1 km
Within 5 km
Within 10 km
Within 25 km


Do not expose exact private addresses publicly.

Use approximate location until a transaction requires more precise information.

15. MATCHING ENGINE

Implement a matching service.

Example:

Need:
"I need a drill tomorrow"

Possible providers:

94% Match
91% Match
87% Match
81% Match


Matching should consider:

Semantic relevance
Category
Distance
Price
Availability
Rating
Reliability
Response rate
Transaction mode


Initial weighted score:

semantic relevance = 30%
location = 20%
price = 15%
availability = 10%
rating = 10%
reliability = 10%
response rate = 5%


Keep these weights configurable.

Do not hardcode them throughout the codebase.

16. OFFERS

Providers can respond to a need.

Offer fields:

Need
Provider
Listing
Price
Deposit
Delivery fee
Message
Availability
Expiration
Status


Statuses:

SENT
VIEWED
COUNTERED
ACCEPTED
REJECTED
EXPIRED
CANCELLED

17. NEGOTIATION

Support:

Initial offer
Counter offer
Accept
Reject


Example:

Provider: ₹5,000

Customer: Can you do ₹4,000?

Provider: ₹4,500 final.

Customer: Accept


All offer changes must be stored as auditable records.

18. MESSAGING

Implement real-time chat using Socket.IO.

Features:

Text
Images
Files
Offer cards
Counter-offer cards
Order information
System messages

Persist messages in MongoDB.

Socket.IO is for realtime transport.

MongoDB remains the source of truth.

Users must not be able to contact another user outside legitimate marketplace contexts without appropriate authorization.

19. ORDER SYSTEM

Support:

BUY
RENT
BORROW
SERVICE


Order states:

PENDING
PAYMENT_PENDING
PAID
CONFIRMED
READY
ACTIVE
COMPLETED
CANCELLED
DISPUTED
REFUNDED


Implement proper state transition validation.

Do not allow arbitrary status changes from the frontend.

20. RENTAL SYSTEM

Rental needs:

Start date
End date
Return date
Deposit
Late fee
Damage fee
Inspection


Flow:

Booking
 ↓
Payment/deposit
 ↓
Provider confirmation
 ↓
Pickup/delivery
 ↓
Rental active
 ↓
Return
 ↓
Inspection
 ↓
Deposit release
 ↓
Completion

21. BORROW SYSTEM

Borrow can be free.

Example:

Borrow drill
₹0
Deposit ₹1,000


Support:

Free borrow
Deposit
Optional community credits architecture

Community credits can remain disabled for MVP.

22. PAYMENTS

Build a payment abstraction layer.

Do NOT tightly couple business logic to one payment provider.

Create:

PaymentService
PaymentProvider interface
PaymentTransaction model
Webhook handling
Refund handling
Payout handling


Support the architecture for:

UPI
Cards
Net banking
Marketplace payouts

Use environment variables for provider credentials.

Never store raw card information.

Never trust client-side payment success.

Verify payment status using server-side provider APIs/webhooks.

23. FINANCIAL LEDGER

Implement an auditable ledger architecture.

Do not simply update:

user.balance += amount


Create immutable transaction records.

Support:

CUSTOMER_PAYMENT
PLATFORM_FEE
PROVIDER_PAYABLE
REFUND
DEPOSIT
DEPOSIT_RELEASE
PENALTY
ADJUSTMENT
PAYOUT


Use MongoDB transactions for financial operations where appropriate.

24. AUTHENTICATION

Implement secure authentication.

Support architecture for:

Email/password
Phone OTP
Google login

Use secure cookies where appropriate.

Passwords must be hashed securely.

Implement:

Login
Register
Logout
Refresh/session handling
Password reset
Email verification
Phone verification

Never store plaintext passwords or OTPs.

25. AUTHORIZATION

Roles:

USER
PROVIDER
BUSINESS
MODERATOR
ADMIN
SUPER_ADMIN


Implement backend authorization guards.

Never rely on frontend route protection for security.

26. CATEGORY SYSTEM

Categories must be dynamic.

Initial categories:

Electronics
Tools & Equipment
Furniture
Vehicles
Event Equipment
Home Services
Professional Services
Photography
Sports
Education
Accommodation
Transport
Business Equipment
Other


Admin must be able to create/edit/deactivate categories.

Each category can have dynamic attributes.

Example:

Camera:

brand
model
lens
condition
accessories


Vehicle:

brand
model
year
fuel
transmission
seats


Do not create separate database models for every category.

27. REVIEWS

After successful transactions:

Users can review each other.

Support:

Overall rating
Communication
Quality
Timeliness
Value
Comment


Only legitimate transaction participants can review.

Prevent duplicate reviews.

28. TRUST SYSTEM

Implement:

Phone verified
Email verified
Identity verified
Business verified
Completed transactions
Rating
Cancellation rate
Response rate


Do not expose private identity documents.

29. REPORTING AND MODERATION

Users can report:

User
Listing
Need
Message
Review

Reasons:

SPAM
FRAUD
PROHIBITED
FAKE
ABUSE
OTHER


Admin can:

Review
Approve
Reject
Suspend
Ban
Resolve
30. AI

Create an abstraction around AI.

AI functions:

parseNeed()
classifyCategory()
expandSearch()
generateEmbedding()
moderateContent()
recommendProviders()


The system must gracefully work when AI is disabled.

For example:

AI unavailable
    ↓
Normal keyword/category search
    ↓
Marketplace still works


Never allow an AI model to directly authorize:

Payments
Refunds
Payouts
Account bans
Financial changes

AI may recommend.

Deterministic backend logic makes final decisions.

31. PWA

Implement a production-quality PWA.

Required:

manifest.webmanifest
service worker
icons
install prompt
offline fallback
theme color
standalone display


Add:

192x192 icon
512x512 icon
maskable icon
favicon
Apple touch icon


Implement an install prompt component.

Do not repeatedly show the prompt after the user dismisses it.

Use feature detection.

32. SERVICE WORKER

Cache:

Static assets
App shell
Public non-sensitive pages


Do NOT blindly cache:

Payments
Orders
Private messages
Authentication
Sensitive account data


Implement a safe caching strategy.

33. PUSH NOTIFICATIONS

Create web push architecture.

Notifications:

New matching need
New offer
Counter offer
Offer accepted
Message
Order update
Rental reminder
Return reminder
Payment update


Persist push subscriptions securely.

Support browser capability detection.

34. OFFLINE

When offline:

Allow:

App shell
Previously cached public content
Recently viewed listings
Saved UI state


Show a clear offline indicator.

Never falsely tell users a transaction was completed while offline.

Critical mutations must be confirmed by the server.

35. ADMIN PANEL

Create a modern admin dashboard.

Dashboard cards:

Users
Providers
Active Needs
Listings
Orders
GMV
Revenue
Disputes
Reports


Charts:

New users
Needs
Orders
Revenue
Fulfillment rate


Admin pages:

Users
Providers
Needs
Listings
Orders
Payments
Categories
Reports
Disputes
Moderation
Reviews
Notifications
Settings

36. DATABASE MODELS

Implement at minimum:

User
Address
Category
Need
Listing
Offer
OfferHistory
Order
Rental
Payment
LedgerEntry
Conversation
Message
Review
Notification
Report
Dispute
Favorite
PushSubscription
AuditLog


Use timestamps.

Add appropriate indexes.

Use references where relationships are required.

Avoid excessive MongoDB population on high-traffic queries.

37. API

Base:

/api/v1


Modules:

/auth
/users
/needs
/listings
/search
/matching
/offers
/orders
/rentals
/payments
/messages
/reviews
/categories
/notifications
/reports
/disputes
/admin


Use consistent API responses.

Success:

{
  "success": true,
  "data": {},
  "meta": {}
}


Error:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {}
  }
}

38. VALIDATION

Use Zod.

Validate:

API inputs
Forms
Query parameters
File metadata
Payment requests
Offer values
Order transitions

Never trust client input.

39. ERROR HANDLING

Implement centralized error handling.

Errors should have:

code
message
HTTP status
optional validation fields
request ID


Do not expose:

Stack traces
Database errors
Secrets
Internal paths

in production responses.

40. SECURITY

Implement:

HTTPS
Secure cookies
Password hashing
Rate limiting
CORS
Helmet/security headers
Input validation
RBAC
Object-level authorization
MongoDB injection protection
XSS protection
CSRF strategy where applicable
File upload validation
Webhook verification
Audit logs


Important:

A user must never be able to change another user's:

Order
Listing
Need
Payment
Profile
Message

by manipulating IDs.

Always perform server-side ownership checks.

41. FILE UPLOADS

Support:

Profile images
Listing images
Need attachments
Chat attachments
Dispute evidence


Use object storage.

Do not store large images directly in MongoDB.

Validate:

MIME type
File extension
File size
Image dimensions


Generate optimized image versions.

Use signed upload/download URLs where appropriate.

42. SEO

Public pages must be SEO-friendly.

Use Next.js metadata.

Implement:

title
description
Open Graph
canonical URL
robots
sitemap
structured data


Listings and category pages should be server-rendered/indexable when public.

Authenticated pages should not be indexed.

43. PERFORMANCE

Use:

Server Components by default
Client Components only when needed
Dynamic imports
Image optimization
Streaming where useful
Efficient MongoDB queries
Proper indexes
Caching
Pagination
Cursor pagination where appropriate

Target:

Fast first load
Fast search
Fast navigation
Minimal JavaScript


Do not load the entire marketplace dataset into the browser.

44. PAGINATION

Never return unlimited records.

Implement pagination for:

Listings
Needs
Offers
Messages
Orders
Users
Reviews
Notifications
Reports


Prefer cursor pagination for large collections.

45. ACCESSIBILITY

Target WCAG 2.2 AA.

Implement:

Keyboard navigation
Focus management
Accessible dialogs
ARIA labels
Form errors
Color contrast
Reduced motion
Screen reader support

46. RESPONSIVE BREAKPOINTS

Support:

Mobile
Tablet
Laptop
Desktop
Large desktop


Every major page must be tested at:

375px
390px
768px
1024px
1440px
1920px

47. COMPONENT ARCHITECTURE

Create reusable components.

Examples:

Navbar
MobileBottomNav
SearchBar
NeedInput
NeedCard
ListingCard
ProviderCard
OfferCard
OrderCard
RatingStars
VerificationBadge
PriceDisplay
LocationDisplay
CategoryCard
FilterPanel
FilterDrawer
Pagination
EmptyState
LoadingSkeleton
ErrorState
ConfirmDialog
InstallPWA
NotificationBell
ChatWindow
ChatMessage
OfferComposer


Avoid duplicating UI.

48. FORMS

Use:

React Hook Form
+
Zod


Forms must support:

Loading
Validation
Server errors
Success state
Disabled state
Mobile UX

Do not lose user-entered form data unnecessarily.

49. DATA FETCHING

Use:

TanStack Query


for server state.

Use Zustand only for genuine client state.

Implement:

loading
error
empty
success


states everywhere.

50. NOTIFICATIONS

Create notification center:

All
Unread
Orders
Offers
Messages
System


Unread count should update correctly.

Support:

In-app
PWA push
Email
SMS


Email/SMS can initially be behind service abstractions.

51. FAVORITES

Users can favorite:

Listings
Providers
Needs

Implement:

POST /favorites
DELETE /favorites
GET /favorites


Prevent duplicates.

52. ANALYTICS

Track events:

USER_REGISTERED
NEED_CREATED
LISTING_CREATED
SEARCH_PERFORMED
MATCH_VIEWED
OFFER_CREATED
OFFER_ACCEPTED
PAYMENT_STARTED
PAYMENT_SUCCESS
ORDER_COMPLETED
RENTAL_STARTED
RENTAL_RETURNED
REVIEW_CREATED
PWA_INSTALL_SHOWN
PWA_INSTALL_ACCEPTED


Keep analytics provider abstracted.

53. MARKETPLACE METRICS

Admin dashboard should calculate:

DAU
MAU
Users
Providers
Needs
Listings
Offers
Orders
GMV
Revenue
Conversion rate
Need fulfillment rate
Provider response rate
Cancellation rate
Dispute rate
Repeat users


Most important:

Need Fulfillment Rate
fulfilled valid needs
---------------------
valid needs

54. TESTING

Implement:

Unit tests

For:

Matching
Pricing
Permissions
Order transitions
Rental calculations
Validation
Integration tests

For:

Authentication
Needs
Listings
Offers
Orders
Payments
Messaging
E2E tests

At minimum:

Flow 1
Register
→ Create Need
→ Provider Offer
→ Accept
→ Order
→ Complete
→ Review

Flow 2
Create Listing
→ Rental
→ Payment
→ Return
→ Deposit release

Flow 3
Need
→ Multiple Offers
→ Counter Offer
→ Accept

Flow 4
Login
→ Install PWA
→ Reopen application

55. SEED DATA

Create development seed data.

Include:

Admin user
Provider users
Normal users
Categories
Listings
Needs
Offers
Reviews
Orders


Use realistic Indian examples.

Example locations:

Delhi
Gurgaon
Noida
Bangalore
Mumbai
Hyderabad
Pune


Do not use real people's private information.

56. DEVELOPMENT ENVIRONMENT

Create:

.env.example
docker-compose.yml
README.md


Environment variables should include:

NODE_ENV=
PORT=

MONGODB_URI=

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

REDIS_URL=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

PAYMENT_SECRET=
PAYMENT_WEBHOOK_SECRET=

AI_API_KEY=

SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=

WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=


Never commit actual secrets.

57. DOCKER

Development Docker environment should support:

web
api
mongodb
redis


Do not put secrets directly in Dockerfiles.

58. CODE QUALITY

Use:

TypeScript strict mode
ESLint
Prettier
Clear naming
Small reusable functions
Strong typing
No unnecessary any
No dead code
No duplicated business logic


Avoid:

any


unless there is a documented reason.

59. ARCHITECTURE PRINCIPLES

Follow:

Separation of concerns
Single responsibility
Dependency inversion
Reusable services
Reusable components
API-first design
Secure by default
Mobile-first
Accessibility-first
Performance-first


Business rules belong in the backend.

Do not duplicate important financial/business rules in the frontend.

60. TRANSACTION SAFETY

Critical operations must be idempotent where applicable.

Examples:

Payment webhook
Order creation
Refund
Payout
Deposit release


A duplicated webhook must not create duplicate financial records.

Use idempotency keys.

61. AUDIT LOGGING

Record sensitive actions:

Login
Logout
Password change
Role change
Listing moderation
User ban
Order status change
Payment event
Refund
Payout
Dispute resolution
Admin action


Admin actions must be traceable.

62. MODERN EMPTY STATES

Do not show blank screens.

Example:

No active needs yet.

Tell us what you're looking for
and we'll help you find someone who can provide it.

[Post a Need]


Create good empty states throughout the application.

63. LOADING STATES

Use skeletons instead of spinners whenever possible.

Examples:

ListingCardSkeleton
NeedCardSkeleton
ProviderCardSkeleton
DashboardSkeleton
ChatSkeleton

64. ERROR STATES

Example:

Something went wrong.

We couldn't load this information.

[Try again]


Do not expose technical errors.

65. DARK MODE

Implement proper dark mode.

Do not simply invert colors.

Every component must have intentional dark-mode styling.

66. MOBILE PWA APP EXPERIENCE

When installed:

Hide unnecessary browser-like navigation
Use standalone layout
Provide mobile bottom navigation
Support safe areas
Handle viewport correctly
Provide install-specific UX
Support app icon
Support splash/theme
Handle offline state
67. BUSINESS LOGIC

Implement strict server-side rules.

Examples:

A cancelled order cannot become completed.

A rejected offer cannot be accepted.

An expired offer cannot be accepted.

A user cannot review an order they were not part of.

A provider cannot modify another provider's listing.

A customer cannot release another customer's deposit.

An admin action must be authorized.

68. API DOCUMENTATION

Generate API documentation.

Prefer OpenAPI/Swagger for the Node.js backend.

Document:

Authentication
Endpoints
Parameters
Request bodies
Responses
Errors
Authorization
69. README

README must include:

Project overview
Architecture
Requirements
Installation
Environment variables
Development commands
Database setup
Seed commands
Testing
Production build
PWA setup
Deployment


A new developer should be able to clone the repository and understand how to run it.

70. IMPLEMENTATION ORDER

Build in this order.

Phase 1

Foundation:

Monorepo
Next.js
NestJS
MongoDB
TypeScript
Tailwind
shadcn
ESLint
Prettier
Environment config
Docker

Phase 2

Authentication:

Register
Login
Logout
Sessions
Profile
Authorization

Phase 3

Marketplace:

Categories
Needs
Listings
Search
Location
Providers

Phase 4

Matching:

Need parsing
Matching engine
Provider discovery
Offers
Negotiation

Phase 5

Communication:

Chat
Socket.IO
Notifications

Phase 6

Transactions:

Orders
Buy
Rent
Borrow
Services
Payments abstraction
Ledger

Phase 7

Trust:

Reviews
Verification
Reports
Moderation
Disputes

Phase 8

PWA:

Manifest
Service worker
Install prompt
Offline
Push

Phase 9

Admin:

Dashboard
Users
Marketplace
Payments
Moderation
Analytics

Phase 10

Testing and production hardening.

71. IMPORTANT DEVELOPMENT BEHAVIOR

Do not stop after generating a plan.

Implement the code.

When you encounter missing information:

Make a sensible engineering decision.
Document the decision.
Continue implementation.
Do not repeatedly ask me for trivial decisions.

Only ask for clarification when a decision would fundamentally change the product or require credentials/secrets that cannot be safely invented.

Never invent:

API secrets
Payment credentials
OAuth secrets
Production database credentials

Use .env.example placeholders.

72. DO NOT USE PLACEHOLDER UI

Do not build pages containing:

Coming soon
Lorem ipsum
Placeholder
TODO
Dummy content


unless it is explicitly inside development-only seed/test data.

All primary pages should have functional UI.

73. DO NOT FAKE FUNCTIONALITY

Do not create buttons that appear functional but do nothing.

If a feature cannot yet be implemented because an external service is unavailable:

Create the proper abstraction
Implement the local flow
Provide clear configuration instructions
Fail gracefully

Do not fake payment success.

Do not fake verification.

Do not fake push notifications.

74. FINAL QUALITY BAR

Before considering the project complete, verify:

✓ TypeScript passes
✓ ESLint passes
✓ Build passes
✓ Unit tests pass
✓ Integration tests pass
✓ E2E critical flows pass
✓ MongoDB indexes exist
✓ API authorization works
✓ PWA installs
✓ Offline shell works
✓ Responsive UI works
✓ Dark mode works
✓ Accessibility basics work
✓ SEO metadata works
✓ Error states exist
✓ Loading states exist
✓ Empty states exist
✓ No secrets committed
✓ README works
✓ .env.example works


Run the actual checks rather than simply claiming they pass.

75. DEFINITION OF DONE

A feature is NOT complete merely because the UI exists.

A feature is complete only when:

UI
+
Frontend validation
+
API
+
Backend validation
+
Database model
+
Authorization
+
Error handling
+
Loading state
+
Empty state
+
Tests
+
Responsive UX


are implemented as appropriate.

76. FIRST TASK

Start now.

First:

Inspect the repository.
Determine what already exists.
Create/update the architecture.
Set up the monorepo if necessary.
Configure Next.js with /src/app.
Configure the Node.js/NestJS API.
Configure MongoDB/Mongoose.
Configure Tailwind and shadcn/ui.
Configure TypeScript/ESLint/Prettier.
Build the initial NEEDX design system.
Build the homepage.
Build authentication foundation.
Build the Need creation flow.
Build the Listing flow.
Build API/database integration.
Continue through the implementation phases above.

After each major phase:

Run tests.
Run type checking.
Run lint.
Run production build.
Fix errors before moving forward.

Do not merely report what should be done.

Write the code, create the files, install the required dependencies, and implement the application.

The final result must be a production-quality, modern, responsive, SEO-friendly, installable Next.js PWA marketplace powered by Node.js and MongoDB, centered around the concept:

