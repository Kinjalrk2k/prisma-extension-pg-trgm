import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const fakePostContent = (): string => {
  const f = faker.hacker.phrase;
  return `${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()} ${f()}`;
};

async function main() {
  const me = await prisma.user.upsert({
    where: { email: "kinjal@gmail.com" },
    create: {
      name: "Kinjal Raykarmakar",
      email: "kinjal@gmail.com",
    },
    update: {
      name: "Kinjal Raykarmakar",
      email: "kinjal@gmail.com",
    },
  });

  const data = new Array(10).fill({}).map(() => ({
    authorId: me.id,
    title: faker.hacker.noun(),
    content: fakePostContent(),
  }));

  console.log(data);

  await prisma.post.createMany({
    data,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
