"use strict";

const path  = require("path");

const fse  = require("fs-extra");
const log  = require("spm-log");
const glob = require("globule");
const Jimp = require("jimp");

let imgGlob = "./img/*.jpg",
    count   = 6,
    output  = "./progFrames",
    help    = {
        i : "filename, path, or glob of files to process",
        c : `number of frames (default ${count})`,
        o : "output to save (default to ./progFrames)"
    },

    width, height;

function newImage(img) {
    width  = img.bitmap.width;
    height = img.bitmap.height;

    return new Promise((resolve, reject) => {
        new Jimp(width, height * count, (err, newImg) => {
            if (err) {
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

    for (let idx = 0; idx < count; idx++) {
        files.push(Jimp.read(file));
    }

    // log.info(files);

    return Promise.all(files)
        .then(imgs => {
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
    imgGlob = flags.i || imgGlob;
    count = flags.c || count;
    output = flags.o || output;

    const files = glob.find(imgGlob);

    log.info("files found", files.length);

    return fse.ensureDir(output)
        .then(() => Promise.all(files.map(processImage)))
        .catch(() => {
            log.error("???", "died");
        });
};

module.exports.help = help;
