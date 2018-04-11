var Pool = require('pg')
var connectionString = 'postgresql://postgres:273109@localhost:5432/postgres';//process.env.DATABASE_URL;//
var pool = new Pool.Client(connectionString);

pool.connect();

module.exports = pool;

//const connectionString = process.env.DATABASE_URL || 'friikdyehsyedi://ec2-23-21-162-90.compute-1.amazonaws.com:5432/dake2nd0sealua';

/*
pool.query('SELECT * FROM tb_customer ORDER BY id_customer ASC ', (err, res) => {
  console.log(err, res)
  pool.end()
})

pool.query('SELECT * FROM tb_detail_nota ', (err, res) => {
  console.log("s");
  console.log(err, res)
  pool.end()
})
*/