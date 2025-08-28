const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('Verification:', bcrypt.compareSync(password, hash));
