"use strict";

const log = require("spm-log"),

    glob   = require("globule"),
    getPix = require("get-pixels"),

    help = {
        i : "filename, path, or glob of files to process",
        c : "number of frames (default 3)"
    };

function processImage(file) {
    log.info("processImage", file);

    getPix(file, (err, pixels) => {
        if(err) {
            log.error("get-pixels", err);

            return Promise.reject(err);
        }

        log.info("got pixels", pixels.shape.slice());
    });

    return true;
}

module.exports = (flagArgs, flags) => {
    if(typeof flags.i !== "string" || !flags.i.length) {
        log.error("Required Parameter", help.i);

        return;
    }

    const files = glob.find(flags.i);

    log.info("File", `found ${files.length} files`);

    return Promise.all(files.map(processImage));

};

exports.help = help;
