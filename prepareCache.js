const fs = require("fs");
const path = require("path");

const sourceFile = path.resolve(
  __dirname,
  "node_modules",
  "geoip-lite",
  "data",
  "geoip-country.dat"
);
const destinationDir = path.resolve(__dirname, "src", "data");

try {
  fs.mkdirSync(destinationDir, { recursive: true });
  fs.copyFileSync(sourceFile, path.join(destinationDir, "geoip-country.dat"));
  console.log("geoip-country.dat copied successfully.");
} catch (err) {
  console.error("Error copying geoip-country.dat:", err);
}
