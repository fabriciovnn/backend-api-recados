import express from 'express';

//criacao do app api servidor
const app = express();

//parse / converte o JSON para o formato que o dado for(array, objeto, string, number...)
app.use(express.json());

app.listen(8080, () => console.log("Servidor iniciado"));

app.get('/', (req, res) => {
  return res.status(200).send('<h1>Bem vindo a Aplicação de Recados!</h1>')
})