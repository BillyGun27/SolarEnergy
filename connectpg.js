var Pool = require('pg');

var connectionString = 'postgres://achsuldzhstdfu:c265e205970cc1047a903e502362ba8cae05516245698d3ee1ac7fa2ae17f4f7@ec2-23-23-142-5.compute-1.amazonaws.com:5432/deb8mtbq62t6v8?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory';//process.env.DATABASE_URL;//'postgresql://postgres:273109@localhost:5432/postgres';
//var connectionString = process.env.DATABASE_URL;//'postgresql://postgres:273109@localhost:5432/postgres';

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