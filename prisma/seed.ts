import { runSeed } from "../src/lib/seed";
import { runKnowledgeSeed } from "../src/lib/knowledge-seed";
import { prisma } from "../src/lib/prisma";

Promise.all([runSeed(), runKnowledgeSeed()])
  .then(([demoResult, knowledgeResult]) => {
    console.log("demo data:", demoResult);
    console.log("knowledge base:", knowledgeResult);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
