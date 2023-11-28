# prisma-extension-pg-trgm

Extending Prisma Client to support `pg_trgm` functions, exclusively for PostgreSQL Databases. `pg_trm` is used for determining similarity between texts based on trigram matching. For extensive documentation on `pr_trgm`, refer [here](https://www.postgresql.org/docs/current/pgtrgm.html)

## Features

- Queries similar to native Prisma's sysntax
- Fully Typed <img src="https://www.typescriptlang.org/favicon-32x32.png" height="16" width="16" alt="" />
- Support for filtering and sorting based on similarity scores
- List of functions implemented:
  - `similarity (text, text)`
  - `word_similarity (text, text)`
  - `strict_word_similarity (text, text)`

## Installation

```sh
npm install prisma-extension-pg-trgm
```

## Extending Prisma client

```ts
import { PrismaClient } from "@prisma/client";
import { withPgTrgm } from "prisma-extension-pg-trgm";

const prisma = new PrismaClient().$extends(withPgTrgm({ logQueries: true }));
```

## Usage

### Basic usage

```ts
async function main() {
  const result = await prisma.post.similarity({
    query: {
      title: {
        similarity: { text: "interpreter", order: "desc" },
        word_similarity: { text: "interpreter", threshold: { gt: 0.01 } },
        strict_word_similarity: { text: "interpreter", threshold: { gt: 0.002, lte: 0.3 } },
      },
    },
  });

  console.log(result);
}

main();
```

> The query in the above example is converted to the following SQL query:
>
> ```sql
> SELECT *,
>   similarity(title, 'interpreter') AS title_similarity_score,
>   word_similarity(title, 'interpreter') AS title_word_similarity_score,
>   strict_word_similarity(title, 'interpreter') AS title_strict_word_similarity_score
> FROM "Post"
> WHERE
>   word_similarity(title, 'interpreter') > 0.01 AND
>   strict_word_similarity(title, 'interpreter') > 0.002 AND
>   strict_word_similarity(title, 'interpreter') <= 0.3
> ORDER BY
>   similarity(title, 'interpreter') desc
> ```

### Renamed model and field names

Prisma allows you to rename the model and field names using `@@map` and `@map` through the Prisma Schema. This has been explained in their official documentation [here](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/use-custom-model-and-field-names#using-map-and-map-to-rename-fields-and-models-in-the-prisma-client-api)

However, the extension has no way to get those modified names. To counter that, look into the following example

Here the `tagName` field has been renamed to `tag_name` and the `tags` model has been renamed to `label`. So, in the database level, you'll find a table name as `label` with a column name as `tag_name`. As this extension relies on [Raw Prisma queries](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryrawunsafe), the actual table and column names are essential

- Prisma Schema:

```prisma
model tags {
  id      Int     @id @default(autoincrement())
  tagName String? @map("tag_name")

  @@map("label")
}
```

- Query:

```ts
async function main() {
  const result = await prisma.tags.similarity({
    query: {
      // the field in Prisma model is tagName, still in database it's tag_name
      tag_name: {
        similarity: { text: "or", threshold: { gte: 0.01 }, order: "desc" },
      },
    },
    __meta: {
      tableName: "label", // here the actual table name is passed
    },
  });

  console.log(result);
}

main();
```

> The query in the above example is converted to the following SQL query:
>
> ```sql
> SELECT *,
>   similarity(tag_name, 'or') AS tag_name_similarity_score
> FROM "label"
> WHERE similarity(tag_name, 'or') >= 0.01
> ORDER BY similarity(tag_name, 'or') desc
> ```

## Known Issues

- This extension relies on [Raw Prisma queries](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryrawunsafe). So, running un-safe queries might come into play. This extension doesn't handle any sanitization of the inputs internally. So, developers implementing this extenstions should put in the right checks before using this in a production system
- There's currently a quirky way to handle renamed model and field values described [above](#renamed-model-and-field-names). If there's a better way to handle this, please consider opening a [Issue](https://github.com/Kinjalrk2k/prisma-extension-pg-trgm/issues/new) or a [Pull Request](https://github.com/Kinjalrk2k/prisma-extension-pg-trgm/pulls) detailing the approach
- Selecting specified fields is currently not supported. Currently all the fields in the model as well as the similarity scores are outputted.
- Joining multiple table are not supported. I'm not a fan of Prisma's joining techniques (https://github.com/prisma/prisma/discussions/12715) and supporting native join might be shelved for a future release
