var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "10df51c44384daa",
  database: "ctf_users"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});