const os = require("os");
const dns = require("dns");
const ping = require("ping");
const { red, green, magenta } = require("console-log-colors");

console.log("");
console.log("");

//////////////////////////////////////////

const subnet = `192.168.${require("./ip.json").third_octet}.`;
const start = 1;
const end = 254;

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  let localIP = null;
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        localIP = iface.address;
      }
    });
  });
  return localIP;
}
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
          } else {
            console.log(green(`${ip}`));
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
