import CLIParser from './CLIParser.mjs';
import path from 'path';

import CompleteCommand from './command/Complete.mjs';
import DevLink from './command/DevLink.mjs';
import HelpCommand from './command/Help.mjs';
import LinkCommand from './command/Link.mjs';
import NPMConvertCommand from './command/NPMConvert.mjs';
import TestCommand from './command/Test.mjs';




/**
* the CLI class provides the basic cli functionality for esm
* it loads all commands and routes the first level of commands
* to their appropriate command instances
*/



export default class CLI {

    /**
    * @param {array} [args]       command line parameters
    */
    constructor({
        args,
    } = {}) {
        this.args = args;
        this.parser = new CLIParser({args});
        this.rootDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../');

        this.setUpCommands();
    }



    /**
    * instantiates all available commands and 
    * adds them to the command map
    */
    setUpCommands() {
        this.commands = new Map();

        [
            CompleteCommand, 
            HelpCommand,
            LinkCommand,
            NPMConvertCommand,
            TestCommand,
            DevLink,
        ].forEach((CommandConstructor) => {
            const instance = new CommandConstructor({
                parser: this.parser,
                cli: this,
            });

            this.commands.set(instance.getName(), instance);
        })
    }



    /**
    * get the command map
    *
    * @returns {Map} commands
    */
    getCommands() {
        return this.commands;
    }


    /**
    * get a specific command by its name
    *
    * @param {string} name              the commands name
    * @returns {(Command|undefined)}    the command or undefined
    */
    getCommand(name) {
        return this.commands.get(name);
    }




    /**
    * run the the cli with a command
    */
    async execute() {
        const command = this.parser.getCommand();


        if (!command) {
            return await this.commands.get('help').execute();
        } else if (this.commands.has(command)) {
            const commandInstance = this.commands.get(command);

            // some commands need some extra loading of data
            await commandInstance.load();

            const result = await commandInstance.execute();

            // let the command shut down resources after use
            await commandInstance.end();

            return result;
        } else {
            throw new Error(`Unknown command '${command}'!`);
        }
    }
}
