const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🤖 ResolvAI - Enterprise AI Customer Ticket Resolution System');
console.log('🚀 Major Project: Starting MERN Backend & Frontend Services...');
console.log('================================================================\n');

// 1. Start Server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// 2. Start Client
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\nStopping services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
