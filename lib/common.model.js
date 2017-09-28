
const crypto = require('crypto');

const pubfun = {

    hashPW:function(pwd){
              return crypto.createHash('sha256').update(pwd).
                digest('base64').toString();
            }
    

};
module.exports=pubfun; 
