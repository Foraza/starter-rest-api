require ('dotenv').config();
const express = require('express')
const app = express()
const CyclicDB = require('@cyclic.sh/dynamodb')
const req = require('express/lib/request')
const db = CyclicDB(process.env.CYCLIC_DB)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
/* app.post('/:col/:key', async (req, res) => {
  console.log(req.body)

  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
}) */

// Delete an item
/* app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
}) */

// Get a single item
/* app.get('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
}) */

// Get a full listing
/* app.get('/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
}) */

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
