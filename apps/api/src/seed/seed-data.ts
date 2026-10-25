/** Realistic Indian seed data — no real people's information, per spec §55. */

export const SEED_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: 'laptop', keywords: ['laptop', 'camera', 'projector', 'tv', 'speaker', 'monitor', 'dslr', 'lens'], attributes: [
    { key: 'brand', label: 'Brand', type: 'TEXT' },
    { key: 'condition', label: 'Condition', type: 'SELECT', options: ['New', 'Like New', 'Good', 'Fair'] },
  ] },
  { name: 'Tools & Equipment', slug: 'tools-equipment', icon: 'wrench', keywords: ['drill', 'ladder', 'toolkit', 'generator', 'welder', 'saw', 'sander'], attributes: [
    { key: 'brand', label: 'Brand', type: 'TEXT' },
    { key: 'powerType', label: 'Power type', type: 'SELECT', options: ['Corded', 'Cordless', 'Manual'] },
  ] },
  { name: 'Furniture', slug: 'furniture', icon: 'sofa', keywords: ['sofa', 'table', 'chair', 'bed', 'wardrobe', 'desk'], attributes: [
    { key: 'material', label: 'Material', type: 'TEXT' },
  ] },
  { name: 'Vehicles', slug: 'vehicles', icon: 'car', keywords: ['car', 'bike', 'scooter', 'cycle', 'bicycle', 'auto'], attributes: [
    { key: 'brand', label: 'Brand', type: 'TEXT' },
    { key: 'fuel', label: 'Fuel', type: 'SELECT', options: ['Petrol', 'Diesel', 'Electric', 'CNG'] },
    { key: 'transmission', label: 'Transmission', type: 'SELECT', options: ['Manual', 'Automatic'] },
  ] },
  { name: 'Event Equipment', slug: 'event-equipment', icon: 'party-popper', keywords: ['projector', 'speaker', 'tent', 'stage', 'lighting', 'decor', 'chairs'], attributes: [
    { key: 'capacity', label: 'Capacity', type: 'NUMBER', unit: 'guests' },
  ] },
  { name: 'Home Services', slug: 'home-services', icon: 'home', keywords: ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'pest control'], attributes: [
    { key: 'experienceYears', label: 'Experience (years)', type: 'NUMBER' },
  ] },
  { name: 'Professional Services', slug: 'professional-services', icon: 'briefcase', keywords: ['accountant', 'lawyer', 'consultant', 'tutor', 'designer', 'developer'], attributes: [] },
  { name: 'Photography', slug: 'photography', icon: 'camera', keywords: ['photographer', 'videographer', 'dslr', 'camera', 'wedding shoot', 'drone'], attributes: [
    { key: 'style', label: 'Style', type: 'SELECT', options: ['Candid', 'Traditional', 'Cinematic'] },
  ] },
  { name: 'Sports', slug: 'sports', icon: 'dumbbell', keywords: ['cricket kit', 'badminton', 'football', 'gym equipment', 'yoga mat', 'treadmill'], attributes: [] },
  { name: 'Education', slug: 'education', icon: 'graduation-cap', keywords: ['tutor', 'coaching', 'books', 'course', 'classes'], attributes: [] },
  { name: 'Accommodation', slug: 'accommodation', icon: 'bed-double', keywords: ['pg', 'flat', 'room', 'hostel', 'guesthouse'], attributes: [] },
  { name: 'Transport', slug: 'transport', icon: 'truck', keywords: ['packers', 'movers', 'truck', 'delivery', 'logistics'], attributes: [] },
  { name: 'Business Equipment', slug: 'business-equipment', icon: 'printer', keywords: ['printer', 'scanner', 'pos machine', 'office chair', 'projector'], attributes: [] },
  { name: 'Other', slug: 'other', icon: 'ellipsis', keywords: [], attributes: [] },
] as const;

export const SEED_CITIES = [
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
];

export const SEED_USERS = [
  { name: 'Admin User', email: 'admin@needx.local', role: 'SUPER_ADMIN', city: 'Delhi' },
  { name: 'Aarav Sharma', email: 'aarav.provider@needx.local', provider: 'INDIVIDUAL', city: 'Gurgaon', business: undefined },
  { name: 'Priya Nair', email: 'priya.provider@needx.local', provider: 'PROFESSIONAL', city: 'Bangalore', business: 'Priya Nair Photography' },
  { name: 'RentEasy Equipment Co.', email: 'renteasy@needx.local', provider: 'BUSINESS', city: 'Mumbai', business: 'RentEasy Equipment Co.' },
  { name: 'Karan Mehta', email: 'karan.provider@needx.local', provider: 'INDIVIDUAL', city: 'Pune', business: undefined },
  { name: 'ToolHub Rentals', email: 'toolhub@needx.local', provider: 'BUSINESS', city: 'Noida', business: 'ToolHub Rentals Pvt Ltd' },
  { name: 'Ananya Iyer', email: 'ananya@needx.local', city: 'Delhi' },
  { name: 'Rohan Gupta', email: 'rohan@needx.local', city: 'Gurgaon' },
  { name: 'Sneha Reddy', email: 'sneha@needx.local', city: 'Hyderabad' },
  { name: 'Vikram Singh', email: 'vikram@needx.local', city: 'Noida' },
  { name: 'Ishita Joshi', email: 'ishita@needx.local', city: 'Mumbai' },
  { name: 'Aditya Kumar', email: 'aditya@needx.local', city: 'Bangalore' },
] as const;

export const SEED_STAFF = [
  {
    name: 'Super Admin',
    email: 'superadmin@needx.local',
    city: 'Delhi',
    department: 'EXECUTIVE',
    designation: 'Chief Platform Officer',
    role: 'SUPER_ADMIN',
    permissions: ['*'],
    queues: ['executive-escalations'],
  },
  {
    name: 'Deepak Verma',
    email: 'support.deepak@needx.local',
    city: 'Delhi',
    department: 'CUSTOMER_SUPPORT',
    designation: 'Senior Support Specialist',
    role: 'STAFF',
    permissions: [
      'users:read',
      'needs:read',
      'orders:read',
      'disputes:read',
      'disputes:resolve',
      'reviews:*',
    ],
    queues: ['tier1-support', 'general-inquiries'],
  },
  {
    name: 'Meera Sen',
    email: 'moderator.meera@needx.local',
    city: 'Bangalore',
    department: 'TRUST_AND_SAFETY',
    designation: 'Trust & Safety Lead Arbitrator',
    role: 'STAFF',
    permissions: [
      'reports:*',
      'disputes:*',
      'moderation:*',
      'users:ban',
      'users:read',
      'reviews:*',
    ],
    queues: ['fraud-alerts', 'high-priority-disputes'],
  },
  {
    name: 'Rahul Khanna',
    email: 'finance.rahul@needx.local',
    city: 'Mumbai',
    department: 'FINANCE',
    designation: 'Treasury & Escrow Controller',
    role: 'STAFF',
    permissions: [
      'payments:*',
      'orders:read',
      'orders:refund',
    ],
    queues: ['escrow-disbursement', 'refund-audit'],
  },
  {
    name: 'Kavita Patel',
    email: 'catalog.kavita@needx.local',
    city: 'Pune',
    department: 'CATALOG_TAXONOMY',
    designation: 'Catalog Quality & Taxonomy Lead',
    role: 'STAFF',
    permissions: [
      'categories:*',
      'listings:*',
    ],
    queues: ['taxonomy-review'],
  },
  {
    name: 'Arjun Kapoor',
    email: 'ops.arjun@needx.local',
    city: 'Gurgaon',
    department: 'OPERATIONS',
    designation: 'Marketplace Operations Lead',
    role: 'ADMIN',
    permissions: [
      'dashboard:*',
      'needs:*',
      'listings:*',
      'orders:*',
      'categories:*',
    ],
    queues: ['marketplace-ops'],
  },
] as const;

export const SEED_LISTINGS = [
  { providerEmail: 'aarav.provider@needx.local', category: 'electronics', title: 'Canon EOS 1500D DSLR with 18-55mm lens', description: 'Well-maintained DSLR, great for events and weekend shoots. Comes with camera bag and spare battery.', type: 'RENTAL', modes: ['RENT'], price: 800, unit: 'DAY', deposit: 3000, condition: 'Good', city: 'Gurgaon' },
  { providerEmail: 'toolhub@needx.local', category: 'tools-equipment', title: 'Bosch Cordless Drill Machine Kit', description: '18V cordless drill with full bit set, ideal for home projects and furniture assembly.', type: 'RENTAL', modes: ['RENT', 'BORROW'], price: 300, unit: 'DAY', deposit: 1000, condition: 'Good', city: 'Noida' },
  { providerEmail: 'renteasy@needx.local', category: 'event-equipment', title: 'Professional PA Speaker System (2000W)', description: 'Full PA setup with mixer, ideal for weddings and corporate events up to 300 guests.', type: 'RENTAL', modes: ['RENT'], price: 4500, unit: 'DAY', deposit: 10000, condition: 'Like New', city: 'Mumbai' },
  { providerEmail: 'priya.provider@needx.local', category: 'photography', title: 'Candid Wedding Photography — Full Day', description: 'Candid + traditional coverage, 2 photographers, same-day highlights reel, full edited album in 3 weeks.', type: 'SERVICE', modes: ['HIRE'], price: 45000, unit: 'SERVICE', condition: undefined, city: 'Bangalore' },
  { providerEmail: 'karan.provider@needx.local', category: 'home-services', title: 'Experienced Electrician — Home & Office', description: '8 years experience, wiring, fittings, inverter setup, same-day service available.', type: 'SERVICE', modes: ['HIRE'], price: 400, unit: 'HOUR', condition: undefined, city: 'Pune' },
  { providerEmail: 'renteasy@needx.local', category: 'furniture', title: 'Study Table with Chair (Set of 2)', description: 'Sturdy engineered wood study table + ergonomic chair, perfect for WFH or students.', type: 'PRODUCT', modes: ['BUY', 'RENT'], price: 3200, unit: 'ITEM', deposit: undefined, condition: 'New', city: 'Mumbai' },
  { providerEmail: 'toolhub@needx.local', category: 'tools-equipment', title: 'Aluminium Extension Ladder (12ft)', description: 'Lightweight and sturdy, great for home maintenance and painting jobs.', type: 'RENTAL', modes: ['RENT', 'BORROW'], price: 150, unit: 'DAY', deposit: 500, condition: 'Good', city: 'Noida' },
  { providerEmail: 'aarav.provider@needx.local', category: 'electronics', title: 'BenQ Full HD Projector', description: '3500 lumens, HDMI + wireless casting support, great for home theatre or office presentations.', type: 'RENTAL', modes: ['RENT'], price: 900, unit: 'DAY', deposit: 2500, condition: 'Good', city: 'Gurgaon' },
] as const;

export const SEED_NEEDS = [
  { userEmail: 'ananya@needx.local', text: 'I need a projector for 2 days in Delhi under ₹2500', title: 'Projector for 2 days', category: 'electronics', modes: ['RENT'], budgetMax: 2500, city: 'Delhi' },
  { userEmail: 'rohan@needx.local', text: 'Looking for a cordless drill for the weekend in Gurgaon', title: 'Cordless drill for the weekend', category: 'tools-equipment', modes: ['RENT', 'BORROW'], budgetMax: 500, city: 'Gurgaon' },
  { userEmail: 'sneha@needx.local', text: 'Need a wedding photographer in Hyderabad, budget around ₹40000', title: 'Wedding photographer needed', category: 'photography', modes: ['HIRE'], budgetMax: 40000, city: 'Hyderabad' },
  { userEmail: 'vikram@needx.local', text: 'I need an electrician tomorrow in Noida for inverter setup', title: 'Electrician for inverter setup', category: 'home-services', modes: ['HIRE'], budgetMax: 1000, city: 'Noida' },
  { userEmail: 'ishita@needx.local', text: 'Want to buy a study table for my home office in Mumbai under ₹4000', title: 'Study table for home office', category: 'furniture', modes: ['BUY'], budgetMax: 4000, city: 'Mumbai' },
] as const;
