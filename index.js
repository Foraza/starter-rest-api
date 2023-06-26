require ('dotenv').config();
const express = require('express')
const app = express()
const CyclicDB = require('@cyclic.sh/dynamodb')
const req = require('express/lib/request')
const db = CyclicDB(process.env.CYCLIC_DB)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cria ou atualiza um usuário
app.post('/users/:id', async (req, res) => {

  const id = req.params.id;
  const item = await db.collection('users').set(id, req.body);

  res.json(item).end();
});

// Obtem informações de um usuário
app.get('/users/:id', async (req, res) => {
  const id = req.params.id;
  const item = await db.collection('users').get(id);

  res.json(item).end();
});

// Fluxo de autenticação
app.get('/auth/:acc_data', async (req, res) => {
  const accData = req.params.acc_data;
  let authData = await db.collection('auth').get(accData);

  // Caso as informações não tenham sido encontradas
  if(!authData){
    res.json({authorized: false}).end;
    return;
  }

  const allowLogin  = req.body.password == authData.props.password;

  const responseData = {
    authorized: allowLogin,
    user_id: allowLogin ? authData.props.user_id : null
  };
  console.log(responseData);
  res.json(responseData).end;
});

// Insere um usuário no fluxo de autenticação
app.post('/auth/:id', async (req, res) => {

  const id = req.params.id;
  const item = await db.collection('auth').set(id, req.body);

  res.end('ok');
});

// Rota genérica de delete
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
