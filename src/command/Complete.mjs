'use strict';


import Command from '../Command.mjs';




export default class CompleteCommand extends Command {

    constructor(options) {
        super(options);

        this.setName('complete');
    }



    /**
    * hides the commadn from the autocompletion and the help command
    */
    isHidden() {
        return true;
    }



    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm complete wordIndex, line, [word...]`,
            short: `gathers auto complete infromation for bash`,
            description: ``,
            examples: []
        }
    }



    /**
    * get command auto complete words
    */
    async getCompletion(words, wordIndex) {
        
    }



    /**
    * run the command
    */
    async execute() {
        if (this.parser.getWordIndex() === 1) {
            const commands = this.cli.getCommands();
            const commandKeys = [...this.cli.getCommands().values()].filter((command) => {
                return !command.isHidden();
            }).map(command => command.getName());

            return this.parser.getCompletion(commandKeys, true);
        } else {
            const commandName = this.parser.getWordAtIndex(1);
            const command = this.cli.getCommand(commandName);
            const completionValues = await command.getCompletion(this.parser.getWords().slice(1), this.parser.getWordIndex()-1);

            if (completionValues) {
                return completionValues;
            }
        }
    }
}