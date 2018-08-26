'use strict';


import Command from '../Command.mjs';
import path from 'path';
import fs from 'fs';
import os from 'os';


const {promises: {stat}} = fs;



export default class LinkCommand extends Command {
     constructor(options) {
        super(options);

        this.setName('help');
    }





    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm help [command]`,
            short: `shows help information for esm or one of its commands`,
            description: ``,
            examples: [{
                syntax: `esm help`,
                short: `show the help for esm`,
            }, {
                syntax: `esm help link`,
                short: `shows the help for the link command`,
            }]
        }
    }



    /**
    * get command auto complete words
    */
    async getCompletion(words, wordIndex) {
        if (wordIndex === 1) {
            const commands = [...this.cli.getCommands().keys()];
            return this.parser.getCompletion(commands, true);
        }
    }





    /**
    * pad string to the right
    */
    padRight(input, len, char = ' ') {
        return input+((len-input.length) > 0 ? char.repeat(len-input.length) : '');
    }



    /**
    * link the target module into the target module
    */
    async execute() {
        let text = [];
        const command = this.parser.getArguments(0) || ''; 

        if (command) {

        } else {
            const commands = [...this.cli.getCommands().values()].filter(c => !c.isHidden());

            commands.sort((a, b) => a.getName() > b.getName());

            for (const command of commands) {
                const helpInfo = command.getHelp();
                text.push(this.blue(this.padRight(helpInfo.syntax, 36))+helpInfo.short);
            }
        }

        return this.getProgramDescription()+text.join('\n')+this.getHelpFooter();
    }




    blue(str){
        return `\u{1b}[0;33m${str}\u{1b}[0m`;
    }



    /**
    * return the description for the esm cli
    */
    getProgramDescription() {
        return `\u{1b}[0;37mESM CLI - the es-modules command line interface\u{1b}[0m

Syntax: esm <command>

Commands:
`;
    }


    /**
    * return the footer for the esm help
    */
    getHelpFooter() {
        return `

Configuration files are stored in ${path.join(os.homedir(), '.esm')}

Registry: \u{1b}[0;34mhttps://es-modules.co/\u{1b}[0m
API (http2 only): \u{1b}[0;34mhttps://api.es-modules.co/\u{1b}[0m

\u{1b}[0;2m
ESM organizes your modules and its dependencies in a flat structure.
You always know where to find your modules.

my-winning-project/
├── es-modules/
│   ├── vendor
│   │   └── package
│   │       └── version
│   │           └── es-modules -> ../../../
│   └── distributed-systems
│       └── http2-server
│           ├── x -> ../2.3.19
│           ├── 2.x -> ../2.3.19
│           ├── 2.3.x -> ../2.3.19
│           └── 2.3.19
│               ├── es-modules -> ../../../
│               └── src
│                   ├── HTT2Server.mjs
│                   ├── Response.mjs
│                   └── Request.mjs
├── src
│   └── MyModule.mjs
└── module.yml
\u{1b}[0m`;
    }
}   