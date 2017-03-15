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

let image  = "**/*.img",
    count  = 3,
    output = "./progFrames";

function processImage(file) {
    log.info("processImage", file);

    const newImage = new Promise((resolve, reject) => {
        new Jimp(400, 400, (err, img) => {
            if(err) {
                return reject(err);
            }

            return resolve(img);
        });
    });

    let containerImg;

    return newImage
        .then((newImg) => {
            containerImg = newImg;

            return Jimp.read(file);
        })
        .then((img) => {
            let size = {
                width  : img.bitmap.width,
                height : img.bitmap.height
            };

            log.info("Jimp read file", file);

            img
                // .scale(0.02)
                .resize(6, Jimp.AUTO)
                .resize(size.width, size.height, Jimp.RESIZE_NEAREST_NEIGHBOR)
                // .contain(size.width, size.height, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP, Jimp.RESIZE_NEAREST_NEIGHBOR)
                .contrast(0.5)
                .quality(60)
                .write(path.join(output, path.parse(file).base));

            return img;
        })
        .catch((err) => {
            log.error("Jimp read file", err);

            return err;
        });
}

module.exports = (flagArgs, flags) => {
    image = flags.i || image;
    count = flags.c || count;
    output = flags.o || output;

    const files = glob.find(flags.i);

    log.info("files found", files.length);

    return fsp.ensureDir(output)
        .then(() =>
            Promise.all(files.map(processImage))
        )
        .catch((err) => {
            log.error("???", "died");
        });
};

module.exports.help = help;
