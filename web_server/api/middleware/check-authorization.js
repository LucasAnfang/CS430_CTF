var mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = (req, res, next) => {
   // Call next if we auth with JWT and error if not (Protect routes to auth users)
   // If there is no token or it is invalid error is auth failed thrown 
   try { 
      // const token = req.headers.authorization.split(' ')[1]; This was where we were just using bearer tokens
      //console.log(req);
      const token = req.cookies['TKN'];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.userData = decoded;

      var connection = mysql.createConnection({
         host: "localhost",
         user: "root",
         password: "10df51c44384daa",
         database: "ctf_exercise"
      });
   
      connection.connect(function(error) {
         if (error) throw error;
      });
      
      connection.query('UPDATE ctf_exercise.accounts SET jwt_nonce = jwt_nonce + 1 WHERE _user_id = ? AND jwt_nonce = ?', 
         [req.userData.userId, req.userData.nonce],
         function(error, update_result){
            if(error) {
               // If error is encountered, log it and tell the user their request could not be processed
               return res.status(401).json({
                  message: 'Auth failed'
               });
            }

            // If no rows changed, the nonce must be out of sync or the username is not used 
            if (update_result.changedRows === 0) {
               return res.status(401).json({
                  message: 'Auth failed'
               });
            }

            connection.query('SELECT * FROM ctf_exercise.accounts WHERE _user_id = ?', req.userData.userId,
               function(error, select_result){
                  if(error) {
                     // If error is encountered, log it and tell the user their request could not be processed
                     console.log(error);
                     return res.status(401).json({
                        message: 'Auth failed'
                     });
                  }

                  user = select_result[0]
                  
                  const new_token = jwt.sign(
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
                  req.token = new_token;
                  const decoded = jwt.verify(new_token, process.env.JWT_KEY);
                  req.userData = decoded;
                  next();
               });
         });
   } catch (error) {
      return res.status(401).json({
         message: 'Auth failed'
      });
   }
};