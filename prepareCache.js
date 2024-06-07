const fs = require("fs");
const path = require("path");

const sourceFile = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "geoip-lite",
  "data",
  "geoip-country.dat"
);
const destinationDir = path.resolve(__dirname, "..", "src", "data");
const destinationFile = path.join(destinationDir, "geoip-country.dat");

console.log("Source file:", sourceFile);
console.log("Destination directory:", destinationDir);

try {
  fs.mkdirSync(destinationDir, { recursive: true });
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destinationFile);
    console.log("geoip-country.dat copied successfully.");
  } else {
    console.error("Error: geoip-country.dat not found.");
  }
} catch (err) {
  console.error("Error copying geoip-country.dat:", err);
}
