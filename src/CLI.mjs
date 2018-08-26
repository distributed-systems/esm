'use strict';

import CLIParser from './CLIParser.mjs';
import Output from './Output.mjs';
import CompleteCommand from './command/Complete.mjs'; 
import LinkCommand from './command/Link.mjs'; 




export default class CLI {
    constructor() {
        this.parser = new CLIParser();
        this.output = new Output();

        this.setUpCommands();
    }




    setUpCommands() {
        this.commands = new Map();

        [
            CompleteCommand, 
            LinkCommand,
        ].forEach((CommandConstructor) => {
            const instance = new CommandConstructor({
                parser: this.parser,
                output: this.output,
                cli: this,
            });

            this.commands.set(instance.getName(), instance);
        })
    }




    getCommands() {
        return this.commands;
    }



    getCommand(name) {
        return this.commands.get(name);
    }


    async execute() {
        const command = this.parser.getCommand();


        if (!command) {
            this.output.fail(`Please specify a command!`);
        } else if (this.commands.has(command)) {
            await this.commands.get(command).execute();
        } else {
            this.output.fail(`Unknown command '${command}'!`);
        }
    }
}   