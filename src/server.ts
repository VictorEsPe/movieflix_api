import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());  // prepara o servidor para receber dados em json
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.get("/movies/:genderName", async (req, res) => {
  try {
    const moviesFilteredByGenderName = await prisma.movie.findMany({
      include: {
        genres: true,
        languages: true
      },
      where: {
        genres: {
          name: {
            equals: req.params.genderName,
            mode: "insensitive"
          }
        }
      }
    });

    res.status(200).send(moviesFilteredByGenderName);
  } catch(error) {
    console.error(error);
    
    res.status(500).send({message: "Falha ao buscar filme"});
  }
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  try {
    // verifica se o filme já existe
    const movieWithTheSameTitle = await prisma.movie.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });

    if (movieWithTheSameTitle) {
      res
        .status(409)
        .send({ message: "Já existe um filme cadastrado com este título" });
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Houve um erro ao cadastrar o filme" });
    return;
  }

  res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    if (!movie) {
      res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };
    data.release_date = data.release_date
      ? new Date(data.release_date)
      : undefined;

    await prisma.movie.update({
      where: {
        id,
      },
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao atualizar o filme" });
  }

  res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
  const id =  Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: {id}
    });

    if(!movie) {
      res.status(404).send({message: "Filme não encontrado"});
    }

    await prisma.movie.delete({where: {id}});
  } catch (error) {
    console.error(error);
    
    res.status(500).send({message: "Falha ao remover o registro"});
  }

  res.status(200).send();
});

app.listen(port, () =>
  console.log(`Servidor online em http://localhost:${port}`)
);
