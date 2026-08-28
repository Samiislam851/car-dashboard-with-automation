export type Category = "popular" | "large" | "small" | "exclusive";

export type Car = {
  id: string;
  name: string;
  type: string;
  category: Category[];
  price: number;
  seats: number;
  gearbox: "Manual" | "Automatic";
  fuel: string;
  tint: string;
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "large", label: "Large Car" },
  { id: "small", label: "Small Car" },
  { id: "exclusive", label: "Exclusive Car" },
];

export const CARS: Car[] = [
  { id: "all-new-rush", name: "All New Rush", type: "SUV", category: ["popular", "large"], price: 72, seats: 6, gearbox: "Manual", fuel: "70L", tint: "#3563e9" },
  { id: "cr-v", name: "CR - V", type: "SUV", category: ["popular", "large"], price: 80, seats: 6, gearbox: "Manual", fuel: "80L", tint: "#0f172a" },
  { id: "all-new-terios", name: "All New Terios", type: "SUV", category: ["popular", "large"], price: 74, seats: 6, gearbox: "Manual", fuel: "90L", tint: "#f97316" },
  { id: "cr-v-auto", name: "CR - V", type: "SUV", category: ["popular", "exclusive"], price: 99, seats: 6, gearbox: "Automatic", fuel: "80L", tint: "#0ea5e9" },
  { id: "mg-zx-exclusive", name: "MG ZX Exclusive", type: "Hatchback", category: ["popular", "small", "exclusive"], price: 76, seats: 4, gearbox: "Manual", fuel: "70L", tint: "#ef4444" },
  { id: "new-mg-zs", name: "New MG ZS", type: "SUV", category: ["popular", "small"], price: 80, seats: 6, gearbox: "Manual", fuel: "80L", tint: "#22c55e" },
  { id: "mg-zx-excite", name: "MG ZX Excite", type: "Hatchback", category: ["small"], price: 74, seats: 4, gearbox: "Manual", fuel: "90L", tint: "#a855f7" },
  { id: "new-rush-auto", name: "New Rush", type: "Sedan", category: ["exclusive", "large"], price: 72, seats: 6, gearbox: "Manual", fuel: "70L", tint: "#64748b" },
  { id: "koenigsegg", name: "Koenigsegg", type: "Sport", category: ["exclusive"], price: 99, seats: 2, gearbox: "Manual", fuel: "90L", tint: "#facc15" },
  { id: "nissan-gt-r", name: "Nissan GT - R", type: "Sport", category: ["exclusive", "popular"], price: 80, seats: 2, gearbox: "Manual", fuel: "80L", tint: "#111827" },
  { id: "rolls-royce", name: "Rolls - Royce", type: "Sedan", category: ["exclusive", "large"], price: 96, seats: 4, gearbox: "Manual", fuel: "70L", tint: "#7c3aed" },
  { id: "city-hatch", name: "City Hatch", type: "Hatchback", category: ["small", "popular"], price: 68, seats: 4, gearbox: "Automatic", fuel: "60L", tint: "#14b8a6" },
  { id: "corolla-cross", name: "Corolla Cross", type: "SUV", category: ["popular", "large"], price: 88, seats: 5, gearbox: "Automatic", fuel: "75L", tint: "#e11d48" },
  { id: "civic-turbo", name: "Civic Turbo", type: "Sedan", category: ["popular"], price: 78, seats: 5, gearbox: "Automatic", fuel: "70L", tint: "#1d4ed8" },
  { id: "polo-gti", name: "Polo GTI", type: "Hatchback", category: ["popular", "small"], price: 70, seats: 4, gearbox: "Manual", fuel: "55L", tint: "#f59e0b" },
  { id: "range-evoque", name: "Range Evoque", type: "SUV", category: ["popular", "exclusive"], price: 120, seats: 5, gearbox: "Automatic", fuel: "85L", tint: "#059669" },
];

export const CITIES = ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh", "Bristol"];

export const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

export const STEPS = [
  { title: "Choose Location", body: "Pick the branch that suits you best — we operate pick-up points in every major UK city." },
  { title: "Pick-up Date", body: "Tell us when you need the keys. Choose your date and time, and we get the car ready." },
  { title: "Book your car", body: "Confirm the booking in a few clicks and drive away. No hidden fees, no paperwork queue." },
];

export const FEATURES = [
  { title: "Customer Support", body: "Extremely responsive customer support provided by the team at best car rental UK." },
  { title: "Best Price Guarantted", body: "Extremely best prices for all category people offered at the best car rental UK." },
  { title: "Many Location", body: "Extremely the best location and available near the big cities. Just visit best car rental UK." },
];

export const TESTIMONIALS = [
  { name: "Viezh Robert", city: "Warsaw, Poland", rating: 4.5, quote: "Wow... I am very happy to rent here, it turned out to be more than my expectations and so far there have been no problems. Best Car always the best." },
  { name: "Yessica Christy", city: "Shanghai, China", rating: 4.8, quote: "I like it because I like to travel far and there are no problems with the car. The pick-up took less than five minutes at the airport desk." },
  { name: "Kim Young Jou", city: "Seoul, South Korea", rating: 4.7, quote: "This is very unusual for my business that has been running for several years, the fleet is clean and the price is honest and clear." },
  { name: "Miriam Aguilar", city: "Madrid, Spain", rating: 4.9, quote: "Booking took two minutes and the car was waiting exactly where they said it would be. I have already recommended it to three colleagues." },
  { name: "Daniel Osei", city: "Manchester, UK", rating: 4.6, quote: "Great prices on longer rentals and support actually answers the phone. That alone makes it worth staying with them." },
];

export type AdminSidebarSection = {
  label: string;
  slug: string;
  items: string[];
};

export const ADMIN_SIDEBAR_DETAILS: AdminSidebarSection[] = [
  {
    label: "Inventory",
    slug: "inventory",
    items: ["Products", "Create Product", "Expired Products", "Low Stocks", "Category", "Sub Category", "Brands", "Units", "Variant Attributes", "Warranties", "Print Barcode", "Print QR Code"],
  },
  {
    label: "Stock",
    slug: "stock",
    items: ["Manage Stock", "Stock Adjustment", "Stock Transfer"],
  },
  {
    label: "Sales",
    slug: "sales",
    items: ["Sales", "Invoices", "Sales Return", "Quotation", "POS"],
  },
];