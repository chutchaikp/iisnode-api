var express = require("express")
var cors = require('cors');
const bodyParser = require('body-parser');
// const { getTodo, login } = require("./controller")
const sql = require('mssql');
require('dotenv').config()
const moment = require("moment")

// const postRouter = require('./routes/posts');

var app = express()

var whitelist = [
  'http://monitor.fleetlocate.asia',
  'http://localhost:3000',
  'http://127.0.0.1:5000/api/dlt_device_inactive_internal'
];

var corsOptions = {
  origin: function (origin, callback) {
    // console.log("Whitelist:" + JSON.stringify(whitelist))
    // if same server origin is undefined ?
    console.log(`origin: ${origin}`)

    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS origin:' + origin))
    }
  }
}

//#region config

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

const rawConfig = {
  user: process.env.RAW_USER,
  password: process.env.RAW_PASSWORD,
  server: process.env.RAW_SERVER,
  database: process.env.RAW_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const rawGV300Config = {
  user: process.env.GV300_RAW_USER,
  password: process.env.GV300_RAW_PASSWORD,
  server: process.env.GV300_SERVER,
  database: process.env.GV300_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const rawGt06eConfig = {
  user: process.env.GT06E_RAW_USER,
  password: process.env.GT06E_RAW_PASSWORD,
  server: process.env.GT06E_SERVER,
  database: process.env.GT06E_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const rawFmuConfig = {
  user: process.env.FMU_RAW_USER,
  password: process.env.FMU_RAW_PASSWORD,
  server: process.env.FMU_SERVER,
  database: process.env.FMU_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const simConfig = {
  user: 'biowatchSQL',
  password: 'biowatchSQL',
  server: '172.23.125.2',
  database: 'BW_Internal',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};


//#endregion

// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.json());

// Middleware
// app.use('/api/posts', postRouter);

//#region test

app.get("/api", function (req, res) {
  res.send(`Hello, USER: ${process.env.USER} PASSWORD: ${process.env.PASSWORD} SERVER: ${process.env.SERVER} DATABASE: ${process.env.DATABASE} `)
})

app.get("/api/hello", cors(corsOptions), function (req, res) {
  res.send("Hello Express :)")
})

// app.get("/api/log", function (req, res) {
//   const str = "Et officia sint Lorem culpa tempor sint ullamco voluptate nostrud labore eiusmod cupidatat non.";
//   console.log(str)
//   res.send("Hello Express :)")
// })

// app.get("/api/history/:vehicleID/:dateFrom/:dateTo", function (req, res) {
//   var { vehicleID, dateFrom, dateTo } = req.params
//   const mm = moment().format()
//   const environ = process.env.node_env;
//   const str = `node_env: ${environ} Params vehicleID: ${vehicleID} dateFrom: ${dateFrom} dateTo: ${dateTo}, generate at: ${mm} `
//   console.log(str)
//   res.send(str)
// })

// app.get("/api/todos", function (req, res) {
//   getTodo(req, res)
// })

// app.get("/api/login", function (req, res) {
//   login(req, res)
// })

//#endregion

//#region PRODUCTION 
// login 
app.use('/api/login/:userId/:password', cors(corsOptions), async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('username', sql.VarChar(30), req.params.userId)
      .input('passwd', sql.VarChar(30), req.params.password)
      .execute('api_Login');
    pool.close();
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.json({ message: 'Error!!!' });
  }
});


// exec api_dashboardalertlist '20180401', '20180408', 220 -- siri is in company_id_fk = 1170
/*
  @startdate varchar(30),
  @enddate varchar(30),
  @companyId int
*/

// TODO: -------------------------------------------------------
// TODO: Change to rightFleets (service rigth)

app.use('/api/alerts/:companyIds', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const today = new Date();
    const passDate = today.setDate(today.getDate() - 1);
    const endDate = moment(new Date()).format('YYYYMMDD');
    const startDate = moment(passDate).format('YYYYMMDD');

    let result = await pool.request()
      .input('startdate', sql.VarChar(8), startDate)
      .input('enddate', sql.VarChar(8), endDate)
      .input('companyIds', sql.NVarChar(sql.MAX), req.params.companyIds)
      .execute('api_DashboardAlertList');
    pool.close();
    res.status(200).json(result);
  } catch (ex) {
    res.json({ error: ex.message });
    console.log(ex);
  }
});

app.post('/api/alertlist', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const today = new Date();
    const passDate = today.setDate(today.getDate() - 1);
    const endDate = moment(new Date()).format('YYYYMMDD');
    const startDate = moment(passDate).format('YYYYMMDD');

    const { companyids } = req.body;

    // console.log('post');
    // console.log(companyids);

    // const { server, db, user, password } = conf;
    // const pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
    let result = await pool.request()
      .input('startdate', sql.VarChar(8), startDate)
      .input('enddate', sql.VarChar(8), endDate)
      .input('companyIds', sql.NVarChar(sql.MAX), companyids)
      .execute('api_DashboardAlertList');
    pool.close();
    res.status(200).json(result);
  } catch (ex) {
    res.json({ error: ex.message });
    console.log(ex);
  }
});

app.post('/api/alertlist_v2', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const today = new Date();
    const passDate = today.setDate(today.getDate() - 1);
    const endDate = moment(new Date()).format('YYYYMMDD');
    const startDate = moment(passDate).format('YYYYMMDD');

    const { companyId } = req.body;

    let result = await pool.request()
      .input('startdate', sql.VarChar(8), startDate)
      .input('enddate', sql.VarChar(8), endDate)
      .input('companyId', sql.Int, companyId)
      .execute('api_DashboardAlertList_V2');
    pool.close();
    res.status(200).json(result);
  } catch (ex) {
    res.json({ error: ex.message });
    console.log(ex);
  }
});

// ----- Alert list by right fleets (GET ALERTS BY SERVICE RIGHT) -----
// ----- Created date: 2019-11-04
app.post('/api/alertlist_v3', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    // const today = new Date();
    // const passDate = today.setDate(today.getDate() - 1);
    // const endDate = moment(new Date()).format('YYYYMMDD');
    // const startDate = moment(passDate).format('YYYYMMDD');	

    const { rightFleets } = req.body;

    let result = await pool.request()
      //.input('startdate', sql.VarChar(8), startDate)
      //.input('enddate', sql.VarChar(8), endDate)
      .input('right_fleets', sql.VarChar(sql.MAX), rightFleets)
      .execute('api_DashboardAlertList_V3');
    pool.close();
    res.status(200).json(result);
  } catch (ex) {
    res.json({ error: ex.message });
    console.log(ex);
  }
});

// load truck by userID
/*
app.use('/api/vehicles/:userID', async (req, res) => {
  try {
  const { server, db, user, password } = conf;	
  console.dir(sql);		
    let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);	
    let result = await pool.request()
          .input('userID', sql.Int, parseInt(req.params.userID, 10))
          .execute('api_trucks');    
  sql.close();
    res.status(200).json(result);	
  } catch (er) {
    sql.close();
    res.json({ error: er.message });
    console.log(er);
  }
});
*/

/* V2 
{
    "user": "biowatchSQL",
    "password": "biowatchSQL",
    "server": "203.150.78.214", 172.23.125.2
    "db": "THAIFLEET-V3"
  }
  
*/

app.use('/api/vehicles/:userID', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('userID', sql.Int, parseInt(req.params.userID, 10))
      .execute('api_trucks');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    res.json({ error: er.message });
    console.log(er);
  }
});

// By rightFleets 
app.post('/api/vehicles_v3', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { rightFleets } = req.body;
    let result = await pool.request()
      .input('rightFleets', sql.VarChar(100), rightFleets)
      .execute('api_trucks_v3');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    res.json({ error: er.message });
    console.log(er);
  }
});

app.post('/api/vehicles_v4', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { rightFleets } = req.body;
    let result = await pool.request()
      .input('rightFleets', sql.VarChar(100), rightFleets)
      .execute('api_trucks_v4');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    res.json({ error: er.message });
    console.log(er);
  }
});

app.use('/api/livestatus/:vehicleIds', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    // const { server, db, user, password } = conf;
    // let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
    let result = await pool.request()
      .input('vehicleIds', sql.VarChar(100), req.params.vehicleIds)
      .execute('api_LiveStatus');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

app.use('/api/livestatus_v4/:vehicleIds', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    // const { server, db, user, password } = conf;
    // let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
    let result = await pool.request()
      .input('vehicleIds', sql.VarChar(100), req.params.vehicleIds)
      .execute('api_LiveStatus_v4');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*
ALTER PROCEDURE [dbo].[m_Speed]
  -- Add the parameters for the stored procedure here
  @vehicleId int,
  @recordDate datetime

http://io.fleetlocate.asia:8080/api/speed?vehicleId=4248&recordDate=2018-05-05&pageno=1
*/
app.use('/api/speed/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  // console.log(req.params);	
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordDate', sql.VarChar(100), req.params.recordDate)
      .execute('m_Speed');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

app.use('/api/speed-v5/:vehicleId/:dateFrom/:dateTo', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  // console.log(req.params);	
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('dateFrom', sql.VarChar(100), req.params.dateFrom)
      .input('dateTo', sql.VarChar(100), req.params.dateTo)
      .execute('m_SpeedV5');
    pool.close();
    res.status(200).json(result.recordsets);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*ALTER PROCEDURE [dbo].[m_TripSummary]	
  @vehicleId int,
  @recordDate datetime*/
app.use('/api/trips/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordDate', sql.VarChar(100), req.params.recordDate)
      .execute('api_TripSummary');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/* TripSummary for Mobile V2 */
/*ALTER PROCEDURE [dbo].[m_TripSummary_Mobile]	
  @vehicleId int,
  @recordDate datetime*/
app.use('/api/tripsummary/:truckId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('truckId', sql.Int, req.params.truckId)
      .input('recordDate', sql.VarChar(100), req.params.recordDate)
      .execute('api_TripSummary_Mobile');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*
alter PROCEDURE [dbo].[m_FuelLevelV5]	
  @truckId int, 
  @datetimeFrom datetime,
  @datetimeTo datetime
AS
*/
app.use('/api/fuel-v5/:truckId/:datetimeFrom/:datetimeTo', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('truckId', sql.Int, req.params.truckId)
      .input('datetimeFrom', sql.VarChar(30), req.params.datetimeFrom)
      .input('datetimeTo', sql.VarChar(30), req.params.datetimeTo)
      .execute('m_FuelLevelV5');
    pool.close();
    res.status(200).json(result.recordsets);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*ALTER PROCEDURE [dbo].[m_FuelLevel]	
@vehicleId int,
@recordedDate datetime*/
app.use('/api/fuel/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordedDate', sql.VarChar(100), req.params.recordDate)
      .execute('m_FuelLevel');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*	ALTER PROCEDURE [dbo].[m_RSSIClass]	
  @vehicleId int,
  @recordedDate datetime	*/
app.use('/api/rssi/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordedDate', sql.VarChar(100), req.params.recordDate)
      .execute('m_RSSIClass');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*	ALTER PROCEDURE [dbo].[m_NumberOfSatellites]	
  @vehicleId int	*/
app.use('/api/sat/:vehicleId', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .execute('m_NumberOfSatellites');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*	ALTER PROCEDURE [dbo].[m_History]   
 @vehicleId int,  
 @recordedDate datetime */
app.use('/api/history/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordedDate', sql.VarChar(100), req.params.recordDate)
      .execute('m_History');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

// recordsets
app.use('/api/history-v4/:vehicleId/:recordDate', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('recordedDate', sql.VarChar(100), req.params.recordDate)
      .execute('m_History_V4');
    pool.close();
    res.status(200).json(result.recordsets);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

// -----------------------------------
// -- m_History_V5
// -- http://io.fleetlocate.asia:85/api/history-v5/17355/2024-02-12 08:30/2024-02-12 08:35
// -- exec [dbo].[m_History_V5] 17355, '2024-02-12 08:30', '2024-02-12 08:35'
app.use('/api/history-v5/:truckId/:dateFrom/:dateTo', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('truckId', sql.Int, req.params.truckId)
      .input('dateFrom', sql.VarChar(20), req.params.dateFrom)
      .input('dateTo', sql.VarChar(20), req.params.dateTo)
      .execute('m_History_V5');
    pool.close();
    res.status(200).json(result.recordsets);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});
// -----------------------------------

/* ALTER PROCEDURE [dbo].[m_LiveFleetStatus]	
  @vehicleId int,
  @recordedDate datetime
app.use('/api/rssi/:vehicleId/:recordDate', async (req, res) => {
  try {
    const { server, db, user, password } = conf;
    let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
    let result = await pool.request()
          .input('vehicleId', sql.Int, req.params.vehicleId)
          .input('recordDate', sql.VarChar(100), req.params.recordDate)
          .execute('m_RSSIClass');
    // console.log(result);
    res.status(200).json(result);
    sql.close();
  } catch (er) {
    sql.close();
    res.json({ error: er.message });
  }	
});
  */

/* TODO: get mobile message */
/* ALTER PROCEDURE [dbo].[api_MobileMessage] AS*/
/* create PROCEDURE [dbo].[api_MobileMessageSave]	@company_id_fk int,	@message varchar(MAX) AS */

app.get('/api/message', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('api_MobileMessage');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/* eslint-disable no-tabs */
app.post('/api/message_post', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { message_title, message_body } = req.body;
    let result = await pool.request()
      .input('message_title', sql.NVarChar(sql.MAX), message_title)
      .input('message_body', sql.NVarChar(sql.MAX), message_body)
      .execute('api_MobileMessageSave');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

// TODO delete mobile message (adhoc query)
/*
let pool = await sql.connect(config)
        let result1 = await pool.request()
            .input('input_parameter', sql.Int, value)
            .query('select * from mytable where id = @input_parameter')            
        console.dir(result1)
*/
app.delete('/api/message_delete/:mid', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { message_title, message_body } = req.body;
    let result = await pool.request()
      .input('mid', sql.Int, parseInt(req.params.mid, 10))
      .query('delete MOBILE_MESSAGE where id = @mid');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

/*
app.post('/api/message_post', (req, res) => {
    try {
      const companyIdFk = req.body.companyIdFk;
      const message = req.body.message;
      res.status(200).json({ companyIdFk, message });
    	
      return;
    	
      const { server, db, user, password } = conf;
      let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
      let result = await pool.request()	
          .input('company_id_fk', sql.Int, req.params.companyIdFk)
          .input('message', sql.VarChar(), req.params.message)
          .execute('api_MobileMessageSave');		
      res.status(200).json(result);
      sql.close();
    	
    } catch (er) {
      sql.close(); res.json({ error: er.message });
    }
});
*/

/* TODO: get tokens by companyid : ALTER PROCEDURE [dbo].[api_MobileToken] @compnayid int AS */
app.get('/api/token/:companyid', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('companyid', sql.Int, req.params.companyid)
      .execute('api_MobileToken');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// MobileTokenGetAll
app.get('/api/token_all', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('MobileTokenGetAll');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

/* TODO: token save : create PROCEDURE [dbo].[api_MobileTokenSave] @token varchar(50), @companyids varchar(MAX) */
app.post('/api/token_post', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { token, companyids } = req.body;
    let result = await pool.request()
      .input('token', sql.VarChar(), token)
      .input('companyids', sql.VarChar(), companyids)
      .execute('api_MobileTokenSave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// save only company where user be inside
// change to fleetid service right
app.post('/api/token_post_v2', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    // const { token, companyId, login, rightFleets } = req.body;	
    const { token, companyId, login } = req.body;
    console.log(req.body);

    let result = await pool.request()
      .input('token', sql.VarChar(100), token)
      .input('companyId', sql.Int, companyId)
      .input('login', sql.VarChar(50), login)
      // .input('right_fleets', sql.VarChar(255), rightFleets)

      .execute('api_MobileTokenSaveV2');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// Save token with rightFleets
app.post('/api/token_post_v3', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    // const { token, companyId, login, rightFleets } = req.body;	
    const { token, companyId, login, rightFleets } = req.body;
    console.log(req.body);

    let result = await pool.request()
      .input('token', sql.VarChar(100), token)
      .input('companyId', sql.Int, companyId)
      .input('login', sql.VarChar(50), login)
      .input('right_fleets', sql.VarChar(255), rightFleets)

      .execute('api_MobileTokenSaveV3');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.post('/api/token_remove', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { token } = req.body;
    let result = await pool.request()
      .input('token', sql.VarChar(), token)
      .execute('api_MobileTokenRemove');
    pool.close();

    console.log('Token: ' + token + ' removed!');

    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.get('/api/company', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('api_Company');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// conf-raw.json 860585004390471
app.get('/api/raw/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('api_Raw');
    const jsonraws = result.recordset;
    let html = '<ul>';
    for (var i = 0; i < jsonraws.length; i++) {
      html += '<li>' + jsonraws[i].received + '<br /><b>' + jsonraws[i].message + '</b><br /><br />' + '</li>';
    }
    html += '</ul>';
    pool.close();
    res.send(html);
  } catch (err) {
    console.log('check error');
    console.dir('############### ERROR - MINI TOOL REQUEST ##############');
    console.dir(err);
    pool.close();
    res.status(200).json({ error: "ERROR!" });
  }
});

// raw-gv300
app.get('/api/raw-gv300/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawGV300Config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('api_Raw');
    const jsonraws = result.recordset;
    let html = '<ul>';
    for (var i = 0; i < jsonraws.length; i++) {
      html += '<li>' + jsonraws[i].received + '<br /><b>' + jsonraws[i].message + '</b><br /><br />' + '</li>';
    }
    html += '</ul>';
    pool.close();
    res.send(html);
  } catch (err) {
    console.log('check error');
    console.dir('############### ERROR - MINI TOOL REQUEST ##############');
    console.dir(err);
    pool.close();
    res.status(200).json({ error: "ERROR!" });
  }
});

// raw gt06e
app.get('/api/raw-gt06e/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('api_Gt06E_Raw');
    const jsonraws = result.recordset;
    let html = '<ul>';
    for (var i = 0; i < jsonraws.length; i++) {
      html += '<li>' + jsonraws[i].date_time + '<br />';
      html += '[';
      html += 'serial:' + jsonraws[i].serial + ', ';
      html += 'event:' + jsonraws[i].event_code + ', ';
      html += 'date:' + new Date(jsonraws[i].date_time).toISOString() + ', ';
      html += 'lat:' + jsonraws[i].lat + ', ';
      html += 'long:' + jsonraws[i].lon + ', ';
      html += 'speed:' + jsonraws[i].speed + ', ';
      html += 'signal:' + jsonraws[i].gsm_signal + ', ';
      html += 'satellite:' + jsonraws[i].satellite + ', ';
      html += 'fuel:' + jsonraws[i].fuel + ', ';

      // html += 'power_input:' + jsonraws[i].voltage; // + ', ';
      // html += 'battery:' + jsonraws[i].voltage; // + ', ';
      if (parseInt(jsonraws[i].voltage) > 1000) {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage) / 1000).toFixed(2) + ' voltages';
      } else {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage)).toFixed(2) + ' voltages';
      }

      html += ']';
      html += '<br /><br />' + '</li>';
    }
    html += '</ul>';
    pool.close();
    res.send(html);
  } catch (err) {
    console.log('check error');
    console.dir('############### ERROR - MINI TOOL REQUEST ##############');
    console.dir(err);
    pool.close();
    res.status(200).json({ error: "ERROR!" });
  }
});

// VP200 miniTOOLs 
app.get('/api/raw-vp200/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('api_Gt06E_Raw');
    const jsonraws = result.recordset;
    let html = '<ul>';
    for (var i = 0; i < jsonraws.length; i++) {
      html += '<li>' + jsonraws[i].date_time + '<br />';
      html += '[';
      html += 'serial:' + jsonraws[i].serial + ', ';
      html += 'event:' + jsonraws[i].event_code + ', ';
      html += 'date:' + new Date(jsonraws[i].date_time).toISOString() + ', ';
      html += 'lat:' + jsonraws[i].lat + ', ';
      html += 'long:' + jsonraws[i].lon + ', ';
      html += 'speed:' + jsonraws[i].speed + ', ';
      html += 'signal:' + jsonraws[i].gsm_signal + ', ';
      html += 'satellite:' + jsonraws[i].satellite + ', ';
      html += 'fuel:' + jsonraws[i].fuel + ', ';

      // html += 'power_input:' + jsonraws[i].voltage; // + ', ';
      // html += 'battery:' + jsonraws[i].voltage; // + ', ';
      if (parseInt(jsonraws[i].voltage) > 1000) {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage) / 1000).toFixed(2) + ' voltages';
      } else {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage)).toFixed(2) + ' voltages';
      }

      html += ']';
      html += '<br /><br />' + '</li>';
    }
    html += '</ul>';
    pool.close();
    res.send(html);
  } catch (err) {
    console.log('check error');
    console.dir('############### ERROR - MINI TOOL REQUEST ##############');
    console.dir(err);
    pool.close();
    res.status(200).json({ error: "ERROR!" });
  }
});

// ALL RAW for miniTOOLs 
app.get('/api/raw2/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('api_Gt06E_Raw');
    const jsonraws = result.recordset;
    let html = '<ul>';
    for (var i = 0; i < jsonraws.length; i++) {
      html += '<li>' + jsonraws[i].date_time + '<br />';
      html += '[';
      html += 'serial:' + jsonraws[i].serial + ', ';
      html += 'event:' + jsonraws[i].event_code + ', ';
      html += 'date:' + new Date(jsonraws[i].date_time).toISOString() + ', ';
      html += 'lat:' + jsonraws[i].lat + ', ';
      html += 'long:' + jsonraws[i].lon + ', ';
      html += 'speed:' + jsonraws[i].speed + ', ';
      html += 'signal:' + jsonraws[i].gsm_signal + ', ';
      html += 'satellite:' + jsonraws[i].satellite + ', ';
      html += 'fuel:' + jsonraws[i].fuel + ', ';

      // html += 'power_input:' + jsonraws[i].voltage; // + ', ';
      // html += 'battery:' + jsonraws[i].voltage; // + ', ';


      if (parseInt(jsonraws[i].voltage) > 1000) {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage) / 1000).toFixed(2) + ' voltages';
      } else {
        html += 'power_input:' + (parseInt(jsonraws[i].voltage)).toFixed(2) + ' voltages';
      }


      html += ']';
      html += '<br /><br />' + '</li>';
    }
    html += '</ul>';
    pool.close();
    res.send(html);
  } catch (err) {
    console.log('check error');
    console.dir('############### ERROR - MINI TOOL REQUEST ##############');
    console.dir(err);
    pool.close();
    res.status(200).json({ error: "ERROR!" });
  }
});

app.get('/api/lastposition', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('_api_DeviceLastPosition');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.get('/api/lastposition_test', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('_api_DeviceLastPositionTEST');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.use('/api/dlt_device_inactive', cors(corsOptions), async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      // .input('days', sql.Int, req.params.days)
      .execute('_api_DLTDeviceInactive');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.use('/api/dlt_device_inactive_internal', cors(corsOptions), async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('_api_DLTDeviceInactiveInternal');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

/* save coupon
      @vin nvarchar(50),
      @license_place nvarchar(50),
      @expire_date datetime,
      @owner nvarchar(255)
 */

app.post('/api/coupon_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { vin, license_place, expire_date, owner, certificate } = req.body;
    let result = await pool.request()
      .input('vin', sql.NVarChar(sql.MAX), vin)
      .input('license_place', sql.NVarChar(sql.MAX), license_place)
      .input('expire_date', sql.VarChar(8), expire_date)
      .input('owner', sql.NVarChar(sql.MAX), owner)
      .input('certificate', sql.NVarChar(sql.MAX), certificate)

      .execute('m_SaveCoupon');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.use('/api/coupon_get_all', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('m_GetAllCoupon');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.use('/api/coupon/:vin', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('vin', sql.NVarChar, req.params.vin)
      .execute('m_GetCoupon');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    pool.close();
    res.json({ error: er.message });
  }
});

app.post('/api/coupon_delete', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { vin } = req.body;
    let result = await pool.request()
      .input('vin', sql.NVarChar(50), vin)
      .execute('m_DeleteCoupon');
    pool.close();
    res.status(200).json(result);
  } catch (er) {
    console.dir(er);
    res.json({ error: er.message });
  }
});

// dee-in restricted
app.use('/api/deein', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('DeeinCompanyList');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// save broadcast message
app.post('/api/broadcast_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { th_message_title, en_message_title, th_message_body, en_message_body } = req.body;
    let result = await pool.request()

      .input('th_message_title', sql.NVarChar(sql.MAX), th_message_title)
      .input('en_message_title', sql.NVarChar(sql.MAX), en_message_title)
      .input('th_message_body', sql.NVarChar(sql.MAX), th_message_body)
      .input('en_message_body', sql.NVarChar(sql.MAX), en_message_body)

      .execute('api_MobileMessageSave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// same as coupon saving
app.post('/api/gv300_command_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawGV300Config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial, command } = req.body;
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .input('command', sql.VarChar(255), command)

      .execute('gv300CommandSave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

/* TODO: Service Fee Alert */
app.post('/api/service_fee_alert_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial, eventType } = req.body;
    // console.log(req.body);
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .input('EventType', sql.NVarChar(50), eventType)
      .execute('api_SimServiceFeeAlertSave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

/*
app.post('/api/coupon_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => {	console.dir(err);	});	
  try {
    const { vin, license_place, expire_date, owner, certificate } = req.body;		
    let result = await pool.request()
      .input('vin', sql.NVarChar(sql.MAX), vin)
      .input('license_place', sql.NVarChar(sql.MAX), license_place)
      .input('expire_date', sql.VarChar(8), expire_date)
      .input('owner', sql.NVarChar(sql.MAX), owner)
      .input('certificate', sql.NVarChar(sql.MAX), certificate)
    	
      .execute('m_SaveCoupon');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});
*/

/*
app.use('/api/dlt_device_inactive_post/:days', async (req, res) => {
  try {
    console.log('testing post');
    const { days } = req.body;
    console.log(days);
  	
    const { server, db, user, password } = conf;
    let pool = await sql.connect(`mssql://${user}:${password}@${server}/${db}`);
    let result = await pool.request()
        .input('days', sql.Int, days)
        .execute('_api_DLTDeviceInactive');
    // console.log(result);
    res.status(200).json(result);
    sql.close();
  } catch(err) {
    sql.close(); res.json({ error: err.message });
    console.log(err);
  }
});
*/

/* Mobile push notification V3 */
//#region util function

//#endregion

app.post('/api/mobile_push_notification', async (req, res) => {
  // const pool = await new sql.ConnectionPool(config).connect();
  // pool.on('error', err => {	console.dir(err);	});	
  try {
    const { message, to } = req.body;
    // add cool log message better than using console.log	
    console.log("******************");
    console.dir(to);
    console.log("******************");
    console.dir(message);

    var myTokens = to;

    // test with my device - open this comment
    // var myTokens = [ 'ExponentPushToken[3vqjLvLP_hSRYOv6mtq3Ry]' ];
    // [ 'ExponentPushToken[JCfQsWIV5VJAWGdHBraXt_]',
    // 				'ExponentPushToken[KftdCIJdYaqwzqMq-ie8aa]',
    // 			 ];
    let messages = [];

    myTokens.map((pushToken) => {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
      } else {
        // const data = { channel: 'alerts' };
        messages.push({
          to: pushToken,
          sound: 'default',
          title: message.title,
          body: message.body, // 'This is a test notification',
          // channelId: message.channelId,
          priority: 'high',
          // _displayInForeground: true,
          // data: JSON.stringify(data),
        });
      }
      // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)			  
    });

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    // response message part
    let receiptIds = [];
    for (let ticket of tickets) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }
    logger.debug('###########################');
    console.dir(receiptIds);
    logger.debug('/###########################');

    // logger.error('error message');
    // logger.warn('warn message');
    // logger.info('info message');
    // logger.verbose('verbose message');

    // logger.silly('silly message');

    // tokens
    /* dynamic body = new
                {
                    to = to,
                    title = alertTypeName,
                    body = detail,

                    sound = "default",
                    channelId = "alerts",
                    data = new { truck = alert.TruckName, alertname = alert.EventType, lat = alert.LAT_COORD, lon = alert.LONG_COORD }
                };*/

    /*
    let result = await pool.request()
      .input('token', sql.VarChar(), token)
      .input('companyids', sql.VarChar(), companyids)
      .execute('api_MobileTokenSave');
    pool.close();
    */

    res.status(200).json({ success: true });
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// GT06E command save
app.post('/api/gt06e_command_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawGt06eConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial, command } = req.body;
    // console.log(req.body);
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .input('command', sql.VarChar(50), command)
      .execute('gt06eCommandSave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.post('/api/gt06e_last_starter', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial } = req.body;
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .execute('gt06eGetLastStarter');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

///////////////////////// FMU 126 ////////////////

app.post('/api/fmu_command_save', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawFmuConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial, command } = req.body;
    // console.log(req.body);
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .input('command', sql.VarChar(50), command)
      .execute('BW_COMMANDsave');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.post('/api/fmu_last_starter', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { serial } = req.body;
    let result = await pool.request()
      .input('serial', sql.VarChar(50), serial)
      .execute('gt06eGetLastStarter');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

//////////////////////////////////////////////////

// Update BW_DH_TRUCK
app.post('/api/gt06e_starter_update', async (req, res) => {
  const pool = await new sql.ConnectionPool(rawConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const { truckID, enable } = req.body;
    let result = await pool.request()
      .input('truckID', sql.Int, truckID)
      .input('enable', sql.Int, enable)
      .execute('gt06eStarterUpdateTruck');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// TODO: SIM management
//#region 

app.get('/api/device_dashboard', async (req, res) => {
  const pool = await new sql.ConnectionPool(simConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('DEVICE_DASHBOARD');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.get('/api/device_master', async (req, res) => {
  const pool = await new sql.ConnectionPool(config).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('DEVICE_MASTER_DEVICES');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

// TODO:  DEVICE ACTIVE  + DEVICE INACTIVE
// app.get('/api/device_active', async (req, res) => {
// 	const pool = await new sql.ConnectionPool(simConfig).connect();
// 	pool.on('error', err => {	console.dir(err);	});	
// 	try {				
// 		let result = await pool.request()			
// 			.execute('DEVICE_ACTIVE');
// 		pool.close();
// 		res.status(200).json(result);
// 	} catch (err) {
// 		console.dir(err);
// 		res.json({ error: err.message });
// 	}
// });
// app.get('/api/device_inactive', async (req, res) => {
// 	const pool = await new sql.ConnectionPool(simConfig).connect();
// 	pool.on('error', err => {	console.dir(err);	});	
// 	try {				
// 		let result = await pool.request()			
// 			.execute('DEVICE_INACTIVE');
// 		pool.close();
// 		res.status(200).json(result);
// 	} catch (err) {
// 		console.dir(err);
// 		res.json({ error: err.message });
// 	}
// });

app.get('/api/device_all', async (req, res) => {
  const pool = await new sql.ConnectionPool(simConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .execute('DEVICE_ALL');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.get('/api/device_history/:serial', async (req, res) => {
  const pool = await new sql.ConnectionPool(simConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    let result = await pool.request()
      .input('serial', sql.VarChar(50), req.params.serial)
      .execute('DEVICE_HISTORY');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

app.post('/api/add_sim', async (req, res) => {
  const pool = await new sql.ConnectionPool(simConfig).connect();
  pool.on('error', err => { console.dir(err); });
  try {
    const {
      Device_NO,
      SIM,
      MSISDN,
      Status_SIM,
      Remark,
      BY
    } = req.body;
    // console.log(req.body);
    let result = await pool.request()

      .input('Device_NO', sql.VarChar(50), Device_NO)
      .input('SIM', sql.VarChar(50), SIM)
      .input('MSISDN', sql.VarChar(50), MSISDN)
      .input('Status_SIM', sql.VarChar(20), Status_SIM)
      .input('Remark', sql.NVarChar(sql.MAX), Remark)
      .input('BY', sql.VarChar(50), BY)

      .execute('ADD_SIM');
    pool.close();
    res.status(200).json(result);
  } catch (err) {
    console.dir(err);
    res.json({ error: err.message });
  }
});

//#endregion

//#endregion /PRODUCTION

app.get("*", function (req, res) {
  res.send(`URL: ${req.url} method: ${req.method}`)
  // res.send("This URL is not set :(")
})

var server = app.listen(process.env.PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log(`Server listening host: ${host} port: ${port} `)
})