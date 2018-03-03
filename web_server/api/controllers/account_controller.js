var mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

exports.signup_user = (req, res, next) => {
   /*  
      req.query.user => username
      req.query.pass => pw
   */
   console.log('assessing registration');
   console.log(req.query.user);
   console.log(req.query.pass);
   
   // connect to the database
   var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "10df51c44384daa",
      database: "ctf_exercise_test"
   });

   // Check if username is in use already
   connection.query('SELECT * FROM ctf_exercise_test.ctf_users WHERE username = ?', req.query.user, 
      function(error, result) {
         if(err) {
            // If error is encountered, log it and tell the user their request could not be processed
            console.log(err);
            return res.status(500).json({
               message: 'Request could not be completed'
            });

            if(result) {
               // There exists another user with the same username
               return res.status(409).json({
                  message: 'Username already in use'
               });
            }
         }
      });

   bcrypt.hash(req.query.pass, 10, (err, hash) => {
      if (err) {
         return res.status(500).json({
         error: err
         });
      } else {

         // If the hash did not result in an error try to save the new user
         const new_user = {
            username: req.query.user,
            pw: hash,
            jwt_nonce: Math.floor(Math.random() * 50) + 10,
            balance: 0
         };

         connection.query('INSERT INTO ctf_exercise_test.ctf_users SET ?', new_user,
            function(err, results) {
               if(err) {
                  // If error is encountered, log it and tell the user their request could not be processed
                  console.log(err);
                  return res.status(500).json({
                     message: 'Request could not be completed'
                  });
               }
               res.status(201).json({
                  message: 'User created with balance 0'
               });
            });
         }
   });
}

exports.login_user = (req, res, next) => {
   /*  
      req.query.user => username
      req.query.pass => pw
   */
   console.log('assessing login');
   console.log(req.query.user);
   console.log(req.query.pass);

   connection.query('SELECT * FROM ctf_exercise_test.ctf_users WHERE username = ?', req.query.user, 
      function(error, user) {
         if(err) {
            // If error is encountered, log it and tell the user their request could not be processed
            console.log(err);
            return res.status(500).json({
               message: 'Request could not be completed'
            });

            if (user === null) {
               return res.status(401).json({
                   message: 'Auth failed'
               });
            }
            bcrypt.compare(req.query.pass, user.password, (err, result) => {
                  if (err) {
                     return res.status(401).json({
                        message: 'Auth failed'
                     });
                  } 
                  if (result) {
                     const token = jwt.sign(
                        {
                           username: user.username,
                           userId: user._user_id,
                           nonce: user.jwt_nonce
                        }, 
                        process.env.JWT_KEY,
                        {
                           expiresIn: "1h" // This should probably be really low
                        }
                     );
                     return res.status(200).json({
                        message: 'Auth successful',
                        token: token // token like cookie
                     });
                  }
                  // at this point the password must be incorrect
                  return res.status(401).json({
                     message: 'Auth failed'
                  });
            });
         }
      });
}

exports.logout_user = (req, res, next) => {
   // Dont return the new token
   // The token they have and the currently stored nonce for this user will be out of sync
   return res.status(200).json({
      message: 'Logout successful',
   });
}