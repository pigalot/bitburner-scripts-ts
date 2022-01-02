const fs = require('fs');
const path = require("path");

function ThroughDirectory(Directory) {
    let files = [];
    fs.readdirSync(Directory).forEach(File => {
        const absolute = path.join(Directory, File);
        if (fs.statSync(absolute).isDirectory()) return files = files.concat(ThroughDirectory(absolute));
        else return files.push(absolute);
    });
    return files;
}

const files = ThroughDirectory("./dist");
const json = JSON.stringify(files);
fs.writeFileSync("./temp/files.json", json);
