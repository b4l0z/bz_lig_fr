const os = require("os");
const dns = require("dns");
const ping = require("ping");
const { red, green, magenta } = require("console-log-colors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);
const ipfile = require("./ip.json");
const network = require("network");
const fs = require("fs");

let currentPublicIp = ipfile.currentPublicIP;

app.use("/font", express.static(path.join(__dirname, "font")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../app.html"));
});

server.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});

const subnet = `192.168.${require("./ip.json").third_octet}.`;
const start = 1;
const end = 254;

async function getHostname(ip) {
  return new Promise((resolve, reject) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        resolve(null);
      } else {
        resolve(hostnames[0]);
      }
    });
  });
}
async function scanIPRange() {
  const promises = [];
  const foundIPs = [];
  console.log(green(`Périphériques connectés`), magenta(`(IP Locale: ${require("./ip.json").localIP})`), green(`:`));
  for (let i = start; i <= end; i++) {
    const ip = `${subnet}${i}`;
    promises.push(
      ping.promise.probe(ip).then(async (res) => {
        if (res.alive) {
          const hostname = await getHostname(ip);
          if (ip == require("./ip.json").localIP) return;
          if (hostname) {
            console.log(green(`${ip}`), magenta(`(${hostname})`));
            ipfile[currentPublicIp][ip] = {};
            ipfile[currentPublicIp][ip]["ip"] = ip;
            ipfile[currentPublicIp][ip]["alive"] = true;
            ipfile[currentPublicIp][ip]["ping"] = res.avg;
            ipfile[currentPublicIp][ip]["hostName"] = hostname;
            saveIP();
          } else {
            console.log(green(`${ip}`));
            ipfile[currentPublicIp][ip] = {};
            ipfile[currentPublicIp][ip]["ip"] = ip;
            ipfile[currentPublicIp][ip]["alive"] = true;
            ipfile[currentPublicIp][ip]["ping"] = res.avg;
            saveIP();
          }
          foundIPs.push(ip);
        }
      })
    );
  }

  await Promise.all(promises);
  return foundIPs;
}
scanIPRange();

io.on("connection", (socket) => {
  for (let ipAddress in ipfile[currentPublicIp]) {
    const item = ipfile[currentPublicIp][ipAddress];
    console.log(item); // Affichez l'item dans la console

    // Émettez chaque item via Socket.IO
    io.emit("ip_data", item);
    io.emit("local_ip", ipfile.localIP);
  }
});

function saveIP() {
  fs.writeFile(`./src/ip.json`, JSON.stringify(ipfile, null, 4), (err) => {
    console.log(green("Enregistré dans"), magenta(" ip.json"));
    if (err) console.log(err);
  });
}
