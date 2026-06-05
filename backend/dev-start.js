const net = require('net');

const PORT = Number(process.env.PORT || 5001);
const HOSTS = process.env.HOST ? [process.env.HOST] : ['127.0.0.1', '::1'];

function portIsOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });

    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });

    socket.once('error', () => {
      resolve(false);
    });
  });
}

(async () => {
  const alreadyRunning = await Promise.all(HOSTS.map(host => portIsOpen(host, PORT))).then(results => results.some(Boolean));

  if (alreadyRunning) {
    console.log(`HackTrack backend is already running on http://localhost:${PORT}`);
    console.log('Skipping a second backend launch.');
    process.exit(0);
  }

  require('./server');
})();