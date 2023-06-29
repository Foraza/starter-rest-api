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

app.get('/users', async (req, res) => {
  const item = await db.collection('users').list();

  res.json(item).end();
});

// Insere uma nova transação
app.post('/transactions/:key', async (req, res) => {
  let newUser;
  const key = req.params.key;

  const user = await db.collection('users').get(key);

  if(user){
    const name = user.name;

    // Pega as transações atuais do usuário
    let transactions = user.props.account.transactions;

    /*
    * Cria um novo objeto para a transação a ser inserida. Caso
    * a conta onde a transação está sendo inserida seja a conta
    * remetente, o valor fica negativo. Caso a conta seja a
    * destinatária, o valor se mantem positivo
    */
    let newTransaction = {
      "type": req.body.type,
      "datetime": req.body.datetime,
      "from": req.body.from,
      "to": req.body.to,
      "value": key == req.body.from ? -req.body.value : req.body.value,
    }

    transactions.push(req.body);

    let acc = {
      "type": "checking",
        "acc_num": user.props.account.acc_num,
        "agency": user.props.account.agency,
        "balance": user.props.account.balance + newTransaction.value, 
        "acc_digit": user.props.account.acc_digit,
        "transactions": []
    }

    acc.transactions = transactions;

    newUser = {
      "name": name,
      "account": acc,
    }

    // Adiciona o usuário com as informações atualizadas
    await db.collection('users').set(key, newUser);

    res.end('true');
    return;
  }

  res.end('false');
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

  const allowLogin  = req.query.password == authData.props.password;

  const responseData = {
    authorized: allowLogin,
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
