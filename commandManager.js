const fs = require('fs');
const https = require('https');
const STORAGE = 'discord-multi-slash-panel.json';

let cfg = {
  token: '',
  guild: '',
  channel: '',
  sessionId: '',
  commands: []
};

// Load configuration
try {
  const data = fs.readFileSync(STORAGE, 'utf8');
  cfg = JSON.parse(data);
} catch (e) {
  if (e.code === 'ENOENT') {
    // Create configuration file if it does not exist
    fs.writeFileSync(STORAGE, JSON.stringify(cfg, null, 2));
    console.log('Configuration file created.');
  } else {
    console.error('Error loading configuration:', e);
  }
}

// Save configuration
function save() {
  console.log('Saving configuration...');
  fs.writeFileSync(STORAGE, JSON.stringify(cfg, null, 2));
  console.log('Configuration saved.');
}

// Send request
function sendRequest(options, callback) {
  // Send a request to the Discord API
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(data);
    });
  });
  req.on('error', (e) => {
    console.error('Request error:', e);
  });
  req.write(JSON.stringify(options.body));
  req.end();
}

// Execute command
function executeCommand(cmd) {
  // Execute a command on the Discord API
  const options = {
    method: 'POST',
    hostname: 'discord.com',
    path: '/api/v10/interactions',
    headers: {
      'Authorization': cfg.token,
      'Content-Type': 'application/json'
    },
    body: {
      type: 2,
      application_id: cmd.applicationId,
      guild_id: cfg.guild,
      channel_id: cfg.channel,
      session_id: cfg.sessionId,
      nonce: Date.now().toString(),
      data: {
        version: cmd.version,
        id: cmd.commandId,
        name: cmd.name,
        type: 1,
        options: JSON.parse(cmd.options || '[]')
      }
    }
  };
  sendRequest(options, (data) => {
    console.log(`Command ${cmd.name} sent successfully.`);
  });
}

// Main loop
const lastExecuteTimes = {};
const scheduledIntervals = {};
setInterval(() => {
  // Check each command to see if it should be executed
  cfg.commands.forEach((cmd) => {
    if (cmd.enabled) {
      const now = Date.now();
      const delay = Number(cmd.delay ?? cmd.interval);
      const jitter = Number(cmd.jitter || 0);

      if (!Number.isFinite(delay) || delay < 0 || !Number.isFinite(jitter) || jitter < 0) {
        console.error(`Invalid delay or jitter for command ${cmd.name}.`);
        return;
      }

      if (scheduledIntervals[cmd.name] === undefined) {
        scheduledIntervals[cmd.name] = delay + Math.random() * jitter;
      }
      const interval = scheduledIntervals[cmd.name];

      if (!lastExecuteTimes[cmd.name] || now - lastExecuteTimes[cmd.name] >= interval * 1000) {
        console.log(`Triggering command ${cmd.name} (delay: ${delay}s + random: ${Math.round(interval - delay)}s).`);
        executeCommand(cmd);
        lastExecuteTimes[cmd.name] = now;
        delete scheduledIntervals[cmd.name];
        // Update lastSent and sent
        if (!cmd.lastSent) {
          cmd.lastSent = 0;
        }
        cmd.lastSent = now;
        if (!cmd.sent) {
          cmd.sent = 0;
        }
        cmd.sent++;
        // Save configuration
        save();
      }
    }
  });
}, 1000);

// Start program
console.log('Program started.');