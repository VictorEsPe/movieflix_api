import express from "express";

const app = express();
const port = 3000;

app.get("/movies", (req, res) => {
  res.send("Home page");
});

app.listen(port, () => console.log(`Servidor online em http://localhost:${port}`));