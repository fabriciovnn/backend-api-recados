import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.listen(8080, () => console.log("Server running on port 8080"));

const listaUsuarios = []

app.get('/', (req, res) => {
  return res.status(200).send('<h1>Bem vindo a Aplicação de Recados!</h1><h2>endpoints</h2><ul><li>GET /users - listar usuários</li><li>GET /users/:id - listar usuário pelo ID</li><li>POST /users - criar um usuário</li><li>POST /login - logar usuário</li><li>POST /recados - criar recado</li><li>GET /recados - listar recados usuario logado</li><li>DELETE /recados/:id - deletar recado por ID</li><li>PUT /recados - atualizar recado</li></ul>')
})

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
    mensagem: 'Usuário encontrado pelo ID com sucesso!'})
})

app.post('/users', (req, res) => {
  const dados = req.body

if(!dados.nome || (dados.nome.length < 2)) {
  return res.status(401).json({
    sucesso: false,
    dados: null,
    mensagem: 'É obrigatório informar o nome do usuário.'})
}

if(!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
  return res.status(401).json({   
    sucesso: false,
    dados: null,
    mensagem: 'É obrigatório informar um email válido para cadastro de usuário.'})
}

const usuarioCadastrado = listaUsuarios.some((user) => user.email === dados.email)
if(usuarioCadastrado) {
  return res.status(401).json({
    sucesso: false,
    dados: null,
    mensagem: 'Este email já possui um cadastro em nosso sistema'})
}


if(!dados.senha || (dados.senha.length < 5)) {
  return res.status(401).json({
    sucesso: false,
    dados: null,
    mensagem: 'É necessário informar uma senha válida com no mínimo 5 dígitos'})
}

const usuario = {
  nome: dados.nome,
  email: dados.email,
  senha: dados.senha,
  id: new Date().getTime(),
  recados: [],
  logged: false
}

listaUsuarios.push(usuario)
return res.status(201).json({
  sucesso: true,
  dados: usuario,
  mensagem: 'Usuário cadastrado com sucesso!'})
})

app.post('/login', (req, res) => {
  const dados = req.body
  
  const emailCorreto = listaUsuarios.some((user) => user.email === dados.email)
  const senhaCorreta = listaUsuarios.some((user) => user.senha === dados.senha)

  if(!emailCorreto || !senhaCorreta) {
    res.status(401).json({
      sucesso: false,
      dados: null,
      mensagem: 'Email ou senha estão incorretos.'})
  }

  listaUsuarios.forEach((user) => user.logged = false)

  const usuario = listaUsuarios.find((user) => user.email === dados.email)
  usuario.logged = true

  res.status(201).json({
    sucesso: true,
    dados: usuario,
    mensagem: 'Usuário logado com sucesso!'
  })

})

app.post('/recados', (req, res) => {
  const dados = req.body

  // usuario informar email
  const usuario = listaUsuarios.find((user) => user.email === dados.email)
  if(!usuario || !usuario.logged) {
    return res.status(401).json({
      sucesso: false,
      dados: null,
      mensagem: 'É obrigatório estar cadastrado e logado no sistema para criar um recado.'
    })
  }

  if(!dados.titulo || !dados.descricao || !dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
    return res.status(401).json({
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

  return res.status(201).json({
    sucesso: true,
    dados: recado,
    mensagem: 'Recado criado com sucesso!'
  })
})

app.get('/recados', (req, res) => {
  const sessao = listaUsuarios.find(user => user.logged === true)
  const queryParametro = req.query

  const pagina = Number(queryParametro.pagina) || 1
  const limite = 5
  const totalPaginas = Math.ceil(sessao.recados.length / limite)
  const indice = (pagina - 1) * limite
  const aux = [...sessao.recados]
  const resultado = aux.splice(indice, limite)


  if(!sessao) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'É necessário estar logado no sistema para listar recados'
    })
  }

  return res.status(201).json({
    sucesso: true,
    paginaAtual: pagina,
    totalRegistros: sessao.recados.length,
    totalPaginas: totalPaginas,
    mensagem: `Recados do usuário ${sessao.email} listados com sucesso!`,
    dados: resultado
  })
})

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
    return res.status(401).json({
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
    return res.status(401).json({
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