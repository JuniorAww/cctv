require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const chokidar = require('chokidar');

const maxUploads = 8;

// Конфиги для нескольких серверов
const servers = {
  server1: {
    sshConfig: {
      host: process.env.SERVER1_IP,
      port: process.env.SERVER1_PORT,
      username: process.env.SERVER1_USERNAME,
      privateKey: fs.readFileSync(process.env.CLOUD_KEY),
      passphrase: process.argv[2],
      keepaliveInterval: 20000,
      keepaliveCountMax: 10,
    },
    links: {
      '../bot': '/home/techie/cctv/bot',
      '../api': '/home/techie/cctv/api',
      '../web/dist': '/var/www/html',
    },
  },
  /*server2: {
    sshConfig: {
      host: process.env.SERVER2_IP,
      port: process.env.SERVER2_PORT,
      username: process.env.SERVER2_USERNAME,
      password: process.argv[3],
      keepaliveInterval: 20000,
      keepaliveCountMax: 10,
    },
    links: {
      '../api': '/opt/cctv/api',
      '../web/dist': '/var/www/html',
    },
  },*/
};

const queues = {};
const sftpInstances = {};
const conns = {};
const reconnectTimeouts = {};

function processQueue(serverName) {
  const queue = queues[serverName];
  const sftp = sftpInstances[serverName];
  if (!queue || !sftp || queue.length === 0) return;

  if (queue.isProcessing) return;
  queue.isProcessing = true;

  const tasks = queue.splice(0, Math.min(queue.length, maxUploads));

  Promise.all(tasks.map(task => upload(task, sftp)))
    .then(() => {
      queue.isProcessing = false;
      if (queue.length > 0) setImmediate(() => processQueue(serverName));
    })
    .catch(err => {
      console.error(`[${serverName}] Ошибка обработки очереди:`, err);
      queue.unshift(...tasks);
      queue.isProcessing = false;
      if (conns[serverName]._sock && !conns[serverName]._sock.destroyed) {
        setImmediate(() => processQueue(serverName));
      }
    });
}

function changeFile(serverName, action, link, localPath) {
  if (/goutputstream|readme|license|database/i.test(localPath)) return;
  const queue = queues[serverName];
  if (queue.some(x => x[0] === action && x[2] === localPath)) return;

  if (action === 0) console.log(`[${serverName}] Загрузка:`, localPath);
  else console.log(`[${serverName}] Удаление:`, localPath);

  queue.push([action, link, localPath]);
  processQueue(serverName);
}

async function ensureDir(sftp, dir) {
  const parts = dir.split('/');
  let current = '';
  for (const part of parts) {
    if (!part) continue;
    current += '/' + part;
    await new Promise((resolve, reject) => {
      sftp.mkdir(current, err => {
        if (err && err.code !== 4) reject(err); // код 4 = уже существует
        else resolve();
      });
    });
  }
}

async function upload([action, [localDir, remoteDir], localPath], sftp) {
  const rel = path.relative(localDir, localPath).replace(/\\/g, '/');
  const remotePath = `${remoteDir}/${rel}`;
  const remoteDirPath = remotePath.split('/').slice(0, -1).join('/');

  try {
    if (action === 1) {
      await new Promise((resolve, reject) => {
        sftp.unlink(remotePath, err => {
          if (err && err.code !== 2) reject(err); // игнорируем "No such file"
          else resolve();
        });
      });
      console.log(`Удален: ${remotePath}`);
      return;
    }

    // создаём все папки по цепочке
    await ensureDir(sftp, remoteDirPath);

    await new Promise((resolve, reject) => {
      sftp.fastPut(localPath, remotePath, err => {
        if (err) reject(err);
        else {
          console.log(`Успех для: ${remotePath}`);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error(`Ошибка: ${err.message}`);
    throw err;
  }
}

function setupWatchers(serverName, links) {
  for (const [local, remote] of Object.entries(links)) {
    chokidar.watch(local, {
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })
    .on('add', path => changeFile(serverName, 0, [local, remote], path))
    .on('change', path => changeFile(serverName, 0, [local, remote], path))
    .on('unlink', path => changeFile(serverName, 1, [local, remote], path));
  }
}

function connect(serverName, sshConfig) {
  const conn = new Client();
  conns[serverName] = conn;
  queues[serverName] = [];
  
  conn.on('ready', () => {
    console.log(`[${serverName}] SSH соединение установлено`);
    clearTimeout(reconnectTimeouts[serverName]);
    
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(`[${serverName}] SFTP error:`, err);
        return conn.end();
      }
      sftpInstances[serverName] = sftp;
      setupWatchers(serverName, servers[serverName].links);
      processQueue(serverName);
    });
  });

  conn.on('error', err => console.error(`[${serverName}] SSH error:`, err.message));

  conn.on('close', () => {
    console.log(`[${serverName}] Соединение закрыто. Переподключение через 3 сек...`);
    sftpInstances[serverName] = null;
    reconnectTimeouts[serverName] = setTimeout(() => connect(serverName, sshConfig), 3000);
  });

  conn.connect(sshConfig);
}

// Запускаем подключение для каждого сервера
for (const [name, { sshConfig }] of Object.entries(servers)) {
  connect(name, sshConfig);
}

