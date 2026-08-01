const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Set new password for the main account
const TARGET_EMAIL = 'omar0122462356i@gmail.com';
const NEW_PASSWORD = 'Admin123456';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(NEW_PASSWORD, salt);

  await User.updateOne(
    { email: TARGET_EMAIL },
    { $set: { password: hashed, emailVerified: true, role: 'admin' } }
  );

  console.log(`✅ Password reset for ${TARGET_EMAIL}`);
  console.log(`   New password: ${NEW_PASSWORD}`);
  console.log(`   Role: admin`);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
