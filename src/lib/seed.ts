import { prisma } from "./prisma";

const VEHICLES = [
  {
    name: "Range Rover",
    category: "SUV",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    pricePerDay: 260,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400",
  },
  {
    name: "Audi S3",
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    pricePerDay: 180,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
  },
  {
    name: "Blue Nissan",
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    pricePerDay: 120,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
  },
  {
    name: "Toyota Corolla",
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    pricePerDay: 90,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1623869675184-b09614e0c07e?w=400",
  },
  {
    name: "Compact Car",
    category: "Compact",
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 4,
    pricePerDay: 60,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400",
  },
  {
    name: "Red Toyota",
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    pricePerDay: 95,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400",
  },
  {
    name: "BMW X5",
    category: "SUV",
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 5,
    pricePerDay: 220,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
  },
] as const;

const COUNTRIES = [
  "Nigeria",
  "United States",
  "Brazil",
  "China",
  "Indonesia",
  "Egypt",
  "Kenya",
  "Germany",
];

const PAYMENT_METHODS = ["Paypal", "Apple Pay", "Stripe", "PayU", "Paytm", "Card"];

const STATUSES = ["success", "success", "success", "pending", "cancelled"];

const CUSTOMER_NAMES = [
  "Mike Witzel",
  "Ava Chen",
  "Liam Okafor",
  "Sara Ahmed",
  "Noah Silva",
  "Ethan Wu",
  "Grace Kim",
  "Omar Yusuf",
];

const BOOKINGS_TO_SEED = 60;
const MONTHS_OF_HISTORY = 9;

function randomOf<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export async function runSeed() {
  const existingVehicleCount = await prisma.vehicle.count();

  if (existingVehicleCount > 0) {
    const existingBookingCount = await prisma.booking.count();
    return {
      seeded: false,
      vehicles: existingVehicleCount,
      bookings: existingBookingCount,
      message: "Database already has vehicles — skipped seeding.",
    };
  }

  const vehicles = await Promise.all(
    VEHICLES.map((vehicle) => prisma.vehicle.create({ data: vehicle }))
  );

  const now = new Date();
  const RECENT_BOOKINGS = 20; // guarantees the last-14-days window has data for the summary widget

  const bookingsData = Array.from({ length: BOOKINGS_TO_SEED }, (_, index) => {
    const vehicle = randomOf(vehicles);
    const createdAt =
      index < RECENT_BOOKINGS
        ? new Date(now.getTime() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
        : new Date(
            now.getFullYear(),
            now.getMonth() - (1 + Math.floor(Math.random() * (MONTHS_OF_HISTORY - 1))),
            1 + Math.floor(Math.random() * 27),
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
          );

    return {
      vehicleId: vehicle.id,
      customerName: randomOf(CUSTOMER_NAMES),
      country: randomOf(COUNTRIES),
      paymentMethod: randomOf(PAYMENT_METHODS),
      status: randomOf(STATUSES),
      price: Number(vehicle.pricePerDay) + Math.floor(Math.random() * 800),
      createdAt,
    };
  });

  await prisma.booking.createMany({ data: bookingsData });

  return {
    seeded: true,
    vehicles: vehicles.length,
    bookings: bookingsData.length,
    message: "Seed data created.",
  };
}
