var security = require('./security');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var key="ezan7jl1306kj6ppieugwg66r";
/* var encrypt = function(str) {
  var iv = new Buffer('zeg7wyvbkxtg9zfr');
  var key = new Buffer('c95ad227894374034994e16262a1102b', 'hex');
  var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  var encryptedStr = cipher.update(new Buffer(str, 'utf8'),'buffer', 'base64');
  encryptedStr += cipher.final('base64');
    return encryptedStr.replace(/\//g, "^");
};*/

var decrypt = function(str) {
str=str.replace(/\^/g, "/");
var iv = new Buffer('zeg7wyvbkxtg9zfr');
 var key = new Buffer('c95ad227894374034994e16262a1102b', 'hex');
  var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  var chunks = [];
  var decryptedStr = decipher.update(new Buffer(str, 'base64'), 'binary', 'utf8');
  decryptedStr += decipher.final('utf8');
  return decryptedStr;
};
/*module.exports.createLicense=function(info) {
          console.log("-----------------------------------------");
           console.log(info);
           var kk=encrypt(JSON.stringify(info));
           console.log(kk);
console.log("-----------------------------------------");
       return kk;
 }*/
 module.exports.decryptLicense=function(licenseKey) {
      return decrypt(licenseKey);
}


