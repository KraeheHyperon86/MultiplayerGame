import { favicons } from "favicons";
import fs from "fs";

const source = "favicon.png"; // Dein Ausgangsbild

const configuration = {
  appName: "",
  appShortName: "",
  appDescription: "",
  developerName: "",
  developerURL: null,
  background: "#ffffff",
  theme_color: "#222222",
  start_url: "",
  display: "standalone",
  orientation: "portrait-primary",
  logging: false,
  icons: {
    android: true,
    appleIcon: true,
    favicons: true,
    windows: false,
    yandex: false
  }
};

favicons(source, configuration).then(response => {
  // Speichert die generierten Dateien
  response.images.forEach(image =>
    fs.writeFileSync(`./icons/${image.name}`, image.contents)
  );
  response.files.forEach(file =>
    fs.writeFileSync(`./icons/${file.name}`, file.contents)
  );
  console.log("Manifest und Favicons erfolgreich erstellt!");
});