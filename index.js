"use strict";

const meow = require("meow"),
    progFrames = require("./lib"),

    help = progFrames.help,

    cli = meow(`
        Usage
            $ progFrames <input>

        Options
            -i, --image ${help.i}
            -c, --count ${help.c}
            -o, --output ${help.o}

        Examples
            $ progFrames -i example.jpg -c 5
            $ progFrames -i "./img/**/*.jpg" -c 5
    `, {
        alias : {
            i : "image",
            c : "count",
            o : "output"
        }
    });

progFrames(cli.input, cli.flags);
