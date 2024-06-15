const { default: axios } = require("axios")
const sql = require('mssql');
require('dotenv').config()

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  connectionTimeout: 300000,
  requestTimeout: 300000,
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 300000
  }
};

async function getTodo(req, res) {
  try {
    // console.log(`req.url: ${req.url}`)
    const url = "https://jsonplaceholder.typicode.com/todos"
    const response = await axios.get(url)
    console.log(response.data)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response.data));
  } catch (error) {
    console.log(error.message)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  }
}

async function login(req, res) {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('username', sql.VarChar(30), "DealerBW")
      .input('passwd', sql.VarChar(30), "1234")
      .execute('api_Login');
    pool.close();

    // res.status(200).json(result);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.recordsets));

  } catch (error) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));

    // res.json({ message: 'Error!!!' });
  }
};

module.exports = {
  getTodo,
  login
}