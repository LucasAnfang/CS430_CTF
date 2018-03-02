# CS430_CTF

## Description
This "secure" web server is built using Node.js and Express.js. Setup node on your computer and use whatever text editor/IDE you like (If you have not used VS Code yet I would say give it a shot. Super clean and fun to use). 

If you haven't used Node.js, Javascript, MongoDB, or Postman check out this tutorial:
https://www.youtube.com/watch?v=0oXYLzuucwE&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q

## Setup
open a terminal and in the webserver directory run the command: npm install
This will grab all the node modules referenced in the dependencies list and add them to your workspace. 

DO NOT push the node modules (make sure you have a .gitignre file to avoid this).

To start the server run: npm start (to stop cmd/control + C)

Download Postman to test the various routes. Some routes have check auth flag on the code path (add authorization key-value pair under the request header with value 'bearer **_token_**' 

## Current Tasks
Either figure out how to locally host the mongo database or switch database to mysql and refactor.  

## Current Security Features
+ SSL on https using a self signed cert (run this to create a cert: openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 1)
+ Json Web Tokens (JWTs) for cookies (Token wraps some user data and a nonce)
+ JWTs have a nonce inside that are used to ensure once a token is used. nonce is associated with the user where the DB stores current jwt_nonce value. IF the values are not equivalent on an inbound request the user may have logged out, closed their account, or this request is coming from someone who somehow stole a token and is trying to use it after it has already been used. 
+ password is encrypted before it is stored using bcryt (bcryt also handles the verification check of the password)
+ certain routes are protected by JWT authorization comparing inner nonce values