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
    return res.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: 'Ainda não possui nenhum usuário cadastrado'})
  }

  return res.status(200).json({
    sucesso: true,
    dados: listaUsuarios,
    mensagem: 'Usuarios listados com sucesso!'
  })
})

//Listar usuário por id
app.get('/users/:id', (req, res) => {
  const params = req.params
  const usuarioEncontrado = listaUsuarios.find((user) => user.id == params.id)

  if(!usuarioEncontrado) {
    return res.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: 'Usuário não encontrado pelo ID informado'})
  }
  
  return res.status(200).json({
    sucesso: true,
    dados: usuarioEncontrado,
    mensagem: 'Usuário encontrado com sucesso!'})
})

//Criação de conta
app.post('/users', (req, res) => {
  const dados = req.body

if(!dados.nome || (dados.nome.length < 2)) {
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
  const dados = req.body
  
  const emailCorreto = listaUsuarios.some((user) => user.email === dados.email)
  const senhaCorreta = listaUsuarios.some((user) => user.password === dados.password)

  if(!emailCorreto || !senhaCorreta) {
    res.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: 'Email ou senha estão incorretos.'})
  }

  listaUsuarios.forEach((user) => user.logged = false)

  const usuario = listaUsuarios.find((user) => user.email === dados.email)
  usuario.logged = true

  res.status(200).json({
    sucesso: true,
    dados: usuario,
    mensagem: 'Usuário logado com sucesso!'
  })

})

//Recados
app.post('/recados', (req, res) => {
  const dados = req.body

  // usuario informar email
  const usuario = listaUsuarios.find((user) => user.email === dados.email)
  if(!usuario || !usuario.logged) {
    return res.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: 'É obrigatório estar cadastrado e logado no sistema para criar um recado.'
    })
  }

  if(!dados.titulo || !dados.descricao || !dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
    return res.status(400).json({
      sucess: false,
      dados: null,
      mensagem: 'É obrigatório informar email válido, titulo do recado e descrição do recado.'
    })
  }

  const recado = {
    titulo: dados.titulo,
    descricao: dados.descricao,
    autor: usuario.email,
    id: new Date().getTime()
  }

  usuario.recados.push(recado)

  return res.status(200).json({
    sucesso: true,
    dados: recado,
    mensagem: 'Recado criado com sucesso!'
  })
})

//Deletar Recados
app.delete('/recados/:id', (req, res) => {
  const id = req.params.id
 
  //pegando o usuario dono do recado passado por id
  const autorRecados = []
  listaUsuarios.forEach(user => {
    const possuiRecado = user.recados.some(recado => recado.id == id)
    if(possuiRecado) {
      autorRecados.push(user)
    }
  })

  //validar se autorRecados possui valor
  if(!autorRecados.length) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Recado não existe'
    })
  }

  const sessao = autorRecados[0].logged

  if(!sessao) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'É necessário estar logado no sistema para deletar um recado'
    })
  }

  const indexRecado = autorRecados[0].recados.findIndex(recado => recado.id == id)

  autorRecados[0].recados.splice(indexRecado, 1)

  return res.status(200).json({
    sucesso: true,
    dados: id,
    mensagem: 'Recado deletado com sucesso!'
  })
})

//atualizar recados
app.put('/recados', (req, res) => {
  const novoRecado = req.body
 
  //pegando o usuario dono do recado passado por id
  const autorRecados = []
  listaUsuarios.forEach(user => {
    const possuiRecado = user.recados.some(recado => recado.id == novoRecado.id)
    if(possuiRecado) {
      autorRecados.push(user)
    }
  })

  //validar se autorRecados possui valor
  if(!autorRecados.length) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Recado não existe'
    })
  }

  const sessao = autorRecados[0].logged

  if(!sessao) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'É necessário estar logado no sistema para atualizar um recado'
    })
  }

  const indexRecado = autorRecados[0].recados.findIndex(recado => recado.id == novoRecado.id)

  if(!!novoRecado.titulo) {
   autorRecados[0].recados[indexRecado].titulo = novoRecado.titulo  
  }

  if(!!novoRecado.descricao) {
    autorRecados[0].recados[indexRecado].descricao = novoRecado.descricao  
   }


  return res.status(200).json({
    sucesso: true,
    dados: autorRecados[0].recados[indexRecado],
    mensagem: 'Recado atualizado com sucesso!'
  })
})