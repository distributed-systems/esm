'use strict';




export default class Command {
    constructor({
        name,
        parser,
        cli,
        httpClient,
    }) {
        this.name = name;
        this.parser = parser;
        this.cli = cli;
        this.httpClient = httpClient;
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


    async load() {}
    async end() {}



    getName() {
        return this.name;
    }
}