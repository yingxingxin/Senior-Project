const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'db:generate'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let output = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.stdin.on('ready', () => {
  child.stdin.write('create column\n');
});

// If prompt appears, send selection
setTimeout(() => {
  if (child.stdin.writable) {
    child.stdin.write('\n');
  }
}, 500);

child.on('close', (code) => {
  process.exit(code);
});
