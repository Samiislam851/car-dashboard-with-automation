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
    label: "Main",
    slug: "main",
    items: ["Dashboard", "Super Admin"],
  },
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