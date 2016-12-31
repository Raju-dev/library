var jwt = require('jsonwebtoken')
 , _ = require('lodash')
 , crypto = require('crypto');

 /**
  * Generate new token
  */
 module.exports.generateToken = function(userJSON, life){
   return jwt.sign(_.pick(userJSON, [ 'email', 'username', 'role']), 'secret', {
     expiresIn: life,
     jwtid: generateJTI(userJSON)
   });
 };

 var generateJTI = function(userJSON){
   var cipher = crypto.createCipher('aes192', Date.now() + ':' + userJSON.role);
   cipher.update(userJSON.email + ':' + userJSON.email);
   return cipher.final('hex');
 };
