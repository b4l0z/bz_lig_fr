const network = require("network");
const fs = require("node:fs");
const ip = require("./ip.json");

network.get_private_ip(function (err, localIP) {
  if (err) {
    console.error("Une erreur est survenue lors de la récupération de l'IP locale.", err);
    return;
  }

  console.log(`IP Locale: ${localIP}`);

  const parts2 = localIP.split(".");
  if (parts2.length >= 4) {
    const thirdOctet2 = parts2[2];
    console.log(`Troisième octet: ${thirdOctet2}`);
    ip.third_octet = parseInt(thirdOctet2);
    ip.localIP = localIP;
    saveIP();
  } else {
    console.log("Adresse IP Invalide");
  }
});

function saveIP() {
  fs.writeFile(`./src/ip.json`, JSON.stringify(ip, null, 4), (err) => {
    console.log("Enresgitré dans ip.json");
    if (err) console.log(err);
  });
}
