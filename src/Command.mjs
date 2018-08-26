'use strict';




export default class Command {
    constructor({
        name,
        parser,
        cli,
        output,
    }) {
        this.name = name;
        this.parser = parser;
        this.cli = cli;
        this.output = output;

        this.subCommands = new Map();
    }




    setName(name) {
        this.name = name;
    }


    getName() {
        return this.name;
    }
}