const bcrypt = require('bcrypt')

module.exports = (password => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt)
    return hash;
});