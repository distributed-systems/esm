'use strict';




export default class Command {
    constructor({
        name,
        parser,
        cli,
    }) {
        this.name = name;
        this.parser = parser;
        this.cli = cli;
    }


    /**
    * hides the command from the auto completion and the 
    * help command if set tot true
    */
    isHidden() {
        return false;
    }



    setName(name) {
        this.name = name;
    }



    getName() {
        return this.name;
    }
}