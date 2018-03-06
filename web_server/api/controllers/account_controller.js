var mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup_user = (req, res, next) => {
   /*  
      req.query.user => username
      req.query.pass => pw
   */
   // console.log('assessing registration');
   // console.log(req.query.user);
   // console.log(req.query.pass);
   
   // connect to the database
   var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "10df51c44384daa",
      database: "ctf_exercise"
   });
   
   connection.connect(function(err) {
      if (err) throw err;
      // console.log("Connected!");
   });

   // Check if username is in use already
   connection.query('SELECT * FROM ctf_exercise.accounts WHERE username = ?', req.query.user, 
      function(error, result) {
         if(error) {
            // If erroror is encountered, log it and tell the user their request could not be processed
            // console.log(error);
            return res.status(500).json({
               message: 'Request could not be completed'
            });
         }

         if(result.length > 0) {
            // There exists another user with the same username
            return res.status(409).json({
               message: 'Username already in use'
            });
         }

         bcrypt.hash(req.query.pass, 10, (error, hash) => {
            if (error) {
               return res.status(500).json({
                  error: error
               });
            } else {
      
               // If the hash did not result in an error try to save the new user
               const new_user = {
                  username: req.query.user,
                  pw: hash,
                  jwt_nonce: Math.floor(Math.random() * 50) + 10,
                  balance: 0
               };
      
               connection.query('INSERT INTO ctf_exercise.accounts SET ?', new_user,
                  function(error, results) {
                     if(error) {
                        // If error is encountered, log it and tell the user their request could not be processed
                        // console.log(error);
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
      });
}

exports.login_user = (req, res, next) => {
   /*  
      req.query.user => username
      req.query.pass => pw
   */
   // console.log('assessing login');
   // console.log(req.query.user);
   // console.log(req.query.pass);

   var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "10df51c44384daa",
      database: "ctf_exercise"
   });

   connection.connect(function(error) {
      if (error) throw error;
      // console.log("Connected!");
   });

   connection.query('SELECT * FROM ctf_exercise.accounts WHERE username = ?', req.query.user, 
      function(error, users) {
         if(error) {
            // If error is encountered, log it and tell the user their request could not be processed
            // console.log(error);
            return res.status(500).json({
               message: 'Request could not be completed'
            });
         }
         if (users.length === 0) {
            return res.status(401).json({
                  message: 'Auth failed'
            });
         }
         // Query returns a list so grab the single object
         var user = users[0]
         bcrypt.compare(req.query.pass, user.pw, (err, result) => {
               if (err) {
                  // console.log(err);
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
                  message: 'iAuth failed'
               });
         });
      });
}

exports.logout_user = (req, res, next) => {
   // Dont return the new token
   // The token they have and the currently stored nonce for this user will be out of sync
   return res.status(200).json({
      message: 'Logout successful',
   });
}

exports.manage_assets = (req, res, next) => {
   /*  
       Always included
       req.query.action => action

       May be included depending on action (close and balance has no impact)
       req.query.amount => amount 
   */

   // console.log('assessing asset management request');
   // console.log(req.userData)

   var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "10df51c44384daa",
      database: "ctf_exercise"
   });

   connection.connect(function(error) {
      if (error) throw error;
      // console.log("Connected!");
   });
   
   connection.query('SELECT balance FROM ctf_exercise.accounts WHERE _user_id = ?', req.userData.userId, 
      function(error, result) {
         var currentBalance = result[0].balance;
         if(error) {
            // If error is encountered, log it and tell the user their request could not be processed
            // console.log(error);
            return res.status(500).json({
               message: 'Request could not be completed'
            });
         }

         if (currentBalance === undefined) {
            return res.status(401).json({
                  message: 'Request could not be completed'
            });
         }
         
         if(req.query.action === 'deposit') {
            currentBalance += parseInt(req.query.amount);
            connection.query('UPDATE ctf_exercise.accounts SET balance = ? WHERE _user_id = ?', [currentBalance, req.userData.userId],
               function(error,result){
                  if(error) {
                     // If error is encountered, log it and tell the user their request could not be processed
                     // console.log(error);
                     return res.status(500).json({
                        message: 'Request could not be completed'
                     });
                  }
                  return res.status(200).json({ 
                     balance: currentBalance,
                     token: req.token
                  });
               });
         }
         else if(req.query.action === 'withdraw') {
               var amount = parseInt(req.query.amount);
               if(currentBalance < amount) {
                  return res.status(200).json({ 
                     message: 'current balance to low for specified withdrawal',
                     balance: currentBalance,
                     token:  req.token
                  });
               }
               else 
               {
                  currentBalance -= parseInt(req.query.amount);
                  connection.query('UPDATE ctf_exercise.accounts SET balance = ? WHERE _user_id = ?', [currentBalance, req.userData.userId],
                     function(error,result){
                        if(error) {
                           // If error is encountered, log it and tell the user their request could not be processed
                           // console.log(error);
                           return res.status(500).json({
                              message: 'Request could not be completed'
                           });
                        }
                        return res.status(200).json({ 
                           balance: currentBalance,
                           token: req.token
                        });
                     });
               }
         }
         else if(req.query.action === 'balance') {
               return res.status(200).json({ 
                  balance: currentBalance,
                  token: req.token
               });
         }
         else if(req.query.action === 'close') {
            connection.query('DELETE FROM ctf_exercise.accounts WHERE _user_id = ?', req.userData.userId,
               function(error,result){
                  if(error) {
                     // If error is encountered, log it and tell the user their request could not be processed
                     // console.log(error);
                     return res.status(500).json({
                        message: 'Request could not be completed'
                     });
                  }
                  res.status(200).json({
                     message: 'Account Closed',
                  });
               });
         }
      });
}
