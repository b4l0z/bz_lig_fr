const network = require("network");
const fs = require("node:fs");
const ip = require("./ip.json");
const { red, green, magenta } = require("console-log-colors");

network.get_private_ip(function (err, localIP) {
  if (err) {
    console.log(red("Une erreur est survenue lors de la récupération de l'IP locale.", err));
    return;
  }

  console.log(green(`IP Locale:`), magenta(`${localIP}`));

  const parts2 = localIP.split(".");
  if (parts2.length >= 4) {
    const thirdOctet2 = parts2[2];
    console.log(green(`Troisième octet:`), magenta(` ${thirdOctet2}`));
    ip.third_octet = parseInt(thirdOctet2);
    ip.localIP = localIP;
    saveIP();
  } else {
    console.log(red("Adresse IP Invalide"));
  }
});

function saveIP() {
  fs.writeFile(`./src/ip.json`, JSON.stringify(ip, null, 4), (err) => {
    console.log(green("Enregistré dans"), magenta(" ip.json"));
    if (err) console.log(err);
  });
}
