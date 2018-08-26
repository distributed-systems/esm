'use strict';


import Command from '../Command.mjs';




export default class CompleteCommand extends Command {

    constructor(options) {
        super(options);

        this.setName('complete');
    }


    /**
    * get command help information
    */
    help() {
        
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
            const commands = [...this.cli.getCommands().keys()];
            const completions = this.parser.getCompletion(commands, true);
            process.stdout.write(completions);
        } else {
            const commandName = this.parser.getWordAtIndex(1);
            const command = this.cli.getCommand(commandName);
            const completionValues = await command.getCompletion(this.parser.getWords().slice(1), this.parser.getWordIndex()-1);

            if (completionValues) {
                process.stdout.write(completionValues);
            }
        }
    }
}