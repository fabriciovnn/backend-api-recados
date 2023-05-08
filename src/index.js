import express from 'express';

//criacao do app api servidor
const app = express();

//parse / converte o JSON para o formato que o dado for(array, objeto, string, number...)
app.use(express.json());

app.listen(8080, () => console.log("Servidor iniciado"));


//DATABASE
const listaUsuarios = []

//Bem vindo da aplicação
app.get('/', (req, res) => {
  return res.status(200).send('<h1>Bem vindo a Aplicação de Recados!</h1>')
})

// Listar Usuários
app.get('/users', (req, res) => {

  if(!listaUsuarios.length) {
    return res.status(400).json('Ainda não possui nenhum usuário cadastrado')
  }

  return res.status(200).json(listaUsuarios)
})

//Listar usuário por id
app.get('/users/:id', (req, res) => {
  const params = req.params
  const usuarioEncontrado = listaUsuarios.find((user) => user.id == params.id)

  if(!usuarioEncontrado) {
    return res.status(400).json('Usuário não encontrado pelo ID informado')
  }
  
  return res.status(200).json(usuarioEncontrado)
})

//Criação de conta
app.post('/users', (req, res) => {
  const dados = req.body

if(!dados.nome || (dados.nome.length < 3)) {
  return res.status(400).json('É obrigatório informar o nome do usuário.')
}

if(!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
  return res.status(400).json('É obrigatório informar um email válido para cadastro de usuário.')
}

const usuarioCadastrado = listaUsuarios.some((user) => user.email === dados.email)
if(usuarioCadastrado) {
  return res.status(400).json('Este email já possui um cadastro em nosso sistema')
}


if(!dados.password || (dados.password.length < 5)) {
  return res.status(400).json('É necessário informar uma senha válida com no mínimo 5 dígitos')
}

const usuario = {
  nome: dados.nome,
  email: dados.email,
  password: dados.password,
  id: new Date().getTime(),
  recados: [],
  logged: false
}

listaUsuarios.push(usuario)
return res.status(201).json('Usuário cadastrado com sucesso!')
})

//Login
app.post('/login', (req, res) => {
  const login = req.query
  
  if(login.email && login.email.length) {
    const listaFiltroEmail = listaUsuarios.filter((user) => user.email.includes(login.email))
    
    if(!listaFiltroEmail.length) {
      return res.status(401).json('Não possui nenhum usuário cadastrado com esse email até o momento.')
    }

   const validar = listaFiltroEmail.some((user) => user.password === login.password)

   if(!validar) {
    return res.status(401).json('Senha incorreta. Informe a senha correta por favor.')
   }
    listaFiltroEmail[0].logged = true;
    return res.status(200).json(`Usuário ${listaFiltroEmail[0].nome} logado com sucesso!`)
  }


})

//Recados
app.post('/recados', (req, res) => {
  const recado = req.body
  const logado = listaUsuarios.filter((user) => user.logged == true)


})