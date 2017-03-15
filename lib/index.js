"use strict";

const fsp = require("fs-promise"),
    path  = require("path"),

    log = require("spm-log"),

    glob = require("globule"),
    Jimp = require("jimp"),

    help = {
        i : "filename, path, or glob of files to process",
        c : "number of frames (default 3)",
        o : "output to save (default to ./progFrames)"
    };

let count  = 3,
    output = "./progFrames";

function processImage(file) {
    log.info("processImage", file);

    return Jimp.read(file)
        .then((img) => {
            log.info("Jimp", "got image");

            log.info("Jimp img.bitmap.width", img.bitmap.width);
            log.info("Jimp img.bitmap.height", img.bitmap.height);

            log.info("path", path.join(output, path.parse(file).base));

            img
                .resize(img.bitmap.width / 10, Jimp.AUTO)
                // .resize(img.bitmap.width, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR)
                .quality(60)
                .write(path.join(output, path.parse(file).base));

            return img;
        })
        .catch((err) => {
            log.error("Jimp", err);

            return err;
        });
}

module.exports = (flagArgs, flags) => {
    if(typeof flags.i !== "string" || !flags.i.length) {
        log.error("Required Parameter", help.i);

        return null;
    }

    const files = glob.find(flags.i);

    count = flags.c || count;
    output = flags.o || output;

    log.info("File", `found ${files.length} files`);

    return fsp.ensureDir(output)
        .then(() =>
            Promise.all(files.map(processImage))
        )
        .catch((err) => {
            log.error("???", "died");
        });
};

module.exports.help = help;
