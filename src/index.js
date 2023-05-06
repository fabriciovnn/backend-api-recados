import express from 'express';
//const express = require('express')

//criacao do app api servidor
const app = express();

//parse / converte o JSON para o formato que o dado for(array, objeto, string, number...)
app.use(express.json());

app.listen(8080, () => console.log("Servidor iniciado"));


app.get('/', (req, res) => {
  return res.status(200).send('<h1>Bem vindo a API de Transações</h1>')
})

//DATABASE

// DATABASE
const listaUsuarios = [];


//ROTAS

// USUARIOS

app.use(validarAlgumacoisa)

function validarAlgumacoisa(request, response, next) {
  console.log('Validei')
  next()
}

//MIDDLEWARE que valida os dados
function verificarDados(request, response, next) {
  const dados = request.body

  if(!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
    return response.status(400).json({
      sucess: false,
      dados: null,
      mensagem: 'É obrigatório informar o email válido para cadastro do usuário'
    })
  }

  if(!dados.password || dados.password.length < 6) {
    return response.status(400).json({
      sucess: false,
      dados: null,
      mensagem: 'É obrigatório informar a senha para cadastro do usuário com no mínimo 6 caracteres'
    })
  }

  next()
}

// GET - LISTAR TODOS OS USUÁRIOS
// QUERY PARAMS - /users?email="Joao"&idade="18" - filtros
// PATH PARAMS - /users/1 - buscar UM, atualizar, deletar
app.get('/users', (request, response) => {

  // QUERY = SEMPRE UM OBJETO
  const filtro = request.query


  if (filtro.email && filtro.email.length) {
      const listaFiltradaPorEmail = listaUsuarios.filter((user) => user.email.includes(filtro.email))

      if (!listaFiltradaPorEmail.length) {
          return response.status(404).json({
              sucesso: false,
              dados: null,
              mensagem: 'Não possui usuários cadastrados até o momento que atendam a condição de filtro!'
          })
      }

      return response.status(200).json({
          sucesso: true,
          mensagem: 'Usuários buscados com sucesso',
          dados: listaFiltradaPorEmail
      })

  }

  // 0 - false
  // !== 0 - true
  if (!listaUsuarios.length) {
      return response.status(404).json({
          sucesso: false,
          dados: null,
          mensagem: 'Não possui usuários cadastrados até o momento!'
      })
  }

  return response.status(200).json({
      sucesso: true,
      dados: listaUsuarios,
      mensagem: 'Dados de usuários buscados com sucesso!'
  })
})

// GET - LISTAR UM USUARIO POR ID
app.get('/users/:id', (request, response) => {
  //PARAMETRO DE REQUISICAO É UM OBJETO {id: 17}
  const params = request.params

  const usuarioEncontrado = listaUsuarios.find((user) => user.id == params.id)


  //!undefined - undefined = false, !false = true
  if(!usuarioEncontrado) {
    return response.status(404).json({
      sucesso: false,
      dado: null,
      mensagem: 'Usuário não encontrado pelo ID informado'
    })
  }

  return response.status(200).json({
    sucesso: true,
    dado: usuarioEncontrado,
    mensagem: 'Usuário encontrado'
  })
})

// POST - inserir/cadastrar/criar - CREATE
// body -  É um pacote em formato JSON com os dados necessários para cadastrar um usuário (neste contexto)
app.post('/users', verificarDados, (request, response) => {
  const dados = request.body

  const novoUsuario = {
    id: new Date().getTime(), //forma de gerar um numero randomico unico getTime() retorna a quantidade de milisegundos desde 1970 1 de janeiro até o new Date()
    email: dados.email,
    password: dados.password,
    transactions: []
  }

  const existe = listaUsuarios.some((user) => user.email === novoUsuario.email)

  if(existe) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: 'Outro usuário já está cadastrado com esse email.'
    })
  }

  listaUsuarios.push(novoUsuario)
  return response.status(201).json({
    sucesso: true,
    dados: novoUsuario,
    mensagem: 'Usuário cadastrado com sucesso!'
  })
})