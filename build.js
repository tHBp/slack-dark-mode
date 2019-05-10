const fs = require("fs-extra");
const outputFolder = "./build";

const uploadAndPublish = async () => {
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const EXTENSION_ID = process.env.EXTENSION_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const CLIENT_ID = process.env.CLIENT_ID;

    const webStore = require("chrome-webstore-upload")({
        extensionId: EXTENSION_ID,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN
    });

    const token = await webStore.fetchToken();
    const myZipFile = fs.createReadStream("./slack-dark-mode.zip");
    await webStore.uploadExisting(myZipFile, token);
    await webStore.publish("default", token);
    console.log("Published successfully!");
};

const minifyJS = async () => {
    const Terser = require("terser");
    const [background, theme] = await Promise.all([
        fs.readFile("./background.js", "utf8"),
        fs.readFile("./theme.js", "utf8")
    ]);
    await Promise.all([
        fs.writeFile(`${outputFolder}/background.js`, Terser.minify(background).code),
        fs.writeFile(`${outputFolder}/theme.js`, Terser.minify(theme).code)
    ]);
};

const minifyCSS = async () => {
    const CleanCSS = require("clean-css");
    const inputCSS = await fs.readFile("./override.css", "utf8");
    const options = {
        level: {
            2: {
                all: true
            }
        }
    };
    return fs.writeFile(`${outputFolder}/override.css`, new CleanCSS(options).minify(inputCSS).styles);
};

const createZipBuild = () => {
    const archiver = require("archiver");
    const archive = archiver("zip", {
        zlib: {
            level: 9
        }
    });
    const stream = fs.createWriteStream("slack-dark-mode.zip");

    return new Promise((resolve, reject) => {
        archive
            .directory(outputFolder, false)
            .on("error", err => reject(err))
            .pipe(stream);
        stream.on("close", () => resolve());
        archive.finalize();
    });
};

(async () => {
    await Promise.all([
        fs.emptyDir(outputFolder),
        fs.remove("slack-dark-mode.zip")
    ]);
    await Promise.all([
        fs.copy("icons", `${outputFolder}/icons`),
        fs.copy("manifest.json", `${outputFolder}/manifest.json`)
    ]);
    await Promise.all([
        minifyCSS(),
        minifyJS()
    ]);
    await createZipBuild();
    await uploadAndPublish();
})();