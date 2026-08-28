import { runSeed } from "../src/lib/seed";
import { prisma } from "../src/lib/prisma";

runSeed()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
