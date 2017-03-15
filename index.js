"use strict";

const meow = require("meow"),
    progFrames = require("./lib"),

    help = progFrames.help,

    cli = meow(`
        Usage
            $ progFrames <input>

        Options
            -i, --image filename, path, or glob of files to process
            -c, --count number of frames (default 3)

        Examples
            $ progFrames -i example.jpg -c 5
            $ progFrames -i ./img/**/*.jpg -c 5
    `, {
        alias : {
            i : "image",
            c : "count"
        }
    });

progFrames(cli.input, cli.flags);
