const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webqlCV';

async function createUser(name, email, password, role) {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`User with email ${email} already exists.`);
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  console.log(`Created user: ${email} (${role})`);
}

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await createUser('Admin', 'admin@webql.com', 'admin123', 'admin');
  await createUser('Leader', 'leader@webql.com', 'leader123', 'leader');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 