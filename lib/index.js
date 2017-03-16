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

let image  = "./**/*.jpg",
    count  = 6,
    output = "./progFrames",

    width, height;

function newImage(img) {
    width  = img.bitmap.width;
    height = img.bitmap.height;

    return new Promise((resolve, reject) => {
        new Jimp(width, height * count, (err, newImg) => {
            if(err) {
                return reject(err);
            }

            return resolve(newImg);
        });
    });
}

function processImage(file) {
    log.info("processImage", file);

    // todo: promise.all up in this
    // return Promise.all([
    //         Jimp.read(file).then(newImage),
    //         Jimp.read(file)
    //     ])

    const files = [ Jimp.read(file).then(newImage) ];

    for(let idx = 0; idx < count; idx++) {
        files.push(Jimp.read(file));
    }

    // log.info(files);

    return Promise.all(files)
        .then((imgs) => {
            let outputPath = path.join(output, path.parse(file).base),
                canvas     = imgs.shift(),
                mult = 3;

            // log.info("process imgs", imgs);

            imgs.forEach((img, idx) => {
                let w = Math.floor(width / ((idx + 1) * mult)),
                    h = Math.floor(height / ((idx + 1) * mult)),
                    offset   = height * idx,
                    contrast = 0.4 * (idx / count);

                log.info("WxHxC", `${w}x${h}x${contrast}`);

                canvas.composite(img.resize(w, h).resize(width + (idx + mult) * 2, height + (idx + mult) * 2, Jimp.RESIZE_NEAREST_NEIGHBOR).contrast(contrast), 0, offset);

                mult++;
            });

            canvas
                .write(outputPath);
        })
        .catch((err) => {
            log.error("process imgs", err);

            return err;
        });
}

module.exports = (flagArgs, flags) => {
    image = flags.i || image;
    count = flags.c || count;
    output = flags.o || output;

    const files = glob.find(image);

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
