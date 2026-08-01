const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Verify all existing unverified accounts
  const result = await User.updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true } }
  );
  console.log('Verified accounts:', result.modifiedCount);

  // Make omar admin
  const admin = await User.findOneAndUpdate(
    { email: 'omar0122462356i@gmail.com' },
    { role: 'admin' },
    { new: true, select: 'name email role emailVerified' }
  );
  console.log('Admin user:', JSON.stringify(admin));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
