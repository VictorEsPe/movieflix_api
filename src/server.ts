import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = 3000;

// o underline indica que o parâmetro req não é necessário no endpoint
app.get("/movies", async (_, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genres: true,
      languages: true,
    },
  });
  res.json(movies);
});

// prepara o servidor para receber dados em json
app.use(express.json());

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  await prisma.movie.create({
    data: {
      // o id do filme é dispensável pois o banco de dados foi configurado para auto incrementar o id
      title,
      genre_id,
      language_id,
      oscar_count,
      release_date: new Date(release_date),
    },
  });

  res.status(201).send();
});

app.listen(port, () =>
  console.log(`Servidor online em http://localhost:${port}`)
);
