import { genSaltSync, hashSync } from "bcrypt";

export default (password) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt)
    return hash;
};