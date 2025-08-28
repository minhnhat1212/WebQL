const fs = require('fs');
const path = require('path');

const avatarsPath = path.join(__dirname, 'uploads/avatars');
const tasksPath = path.join(__dirname, 'uploads/tasks');

console.log('Checking upload directories...');

// Kiểm tra thư mục avatars
try {
  if (!fs.existsSync(avatarsPath)) {
    console.log('Creating avatars directory...');
    fs.mkdirSync(avatarsPath, { recursive: true });
  }
  
  // Kiểm tra quyền ghi
  fs.accessSync(avatarsPath, fs.constants.W_OK);
  console.log('✓ Avatars directory is writable');
  
  // Thử tạo file test
  const testFile = path.join(avatarsPath, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✓ Can create and delete files in avatars directory');
  
} catch (error) {
  console.error('✗ Error with avatars directory:', error.message);
}

// Kiểm tra thư mục tasks
try {
  if (!fs.existsSync(tasksPath)) {
    console.log('Creating tasks directory...');
    fs.mkdirSync(tasksPath, { recursive: true });
  }
  
  // Kiểm tra quyền ghi
  fs.accessSync(tasksPath, fs.constants.W_OK);
  console.log('✓ Tasks directory is writable');
  
  // Thử tạo file test
  const testFile = path.join(tasksPath, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✓ Can create and delete files in tasks directory');
  
} catch (error) {
  console.error('✗ Error with tasks directory:', error.message);
}

console.log('Upload directories check completed.');

