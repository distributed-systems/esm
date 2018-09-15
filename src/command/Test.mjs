import RemoteCommand from '../RemoteCommand.mjs';
import path from 'path';
import fs from 'fs';
import os from 'os';


const {promises: {stat}} = fs;



export default class LinkCommand extends RemoteCommand {
     constructor(options) {
        super(options);

        this.setName('test');
    }





    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm test`,
            short: `run the test suite defined by the test command in the module.yml file`,
            description: ``,
            examples: [{
                syntax: `esm test`,
                short: `run the tests`,
            }]
        }
    }




    /**
    * get command auto complete words
    */
    async getCompletion(words, wordIndex) {
        return null;
    }





    /**
    * link the target module into the target module
    */
    async execute() {
        await this.startServer();

        const reponse = await this.httpClient
            .get('/module-yml')
            .setHeader('module', process.cwd())
            .setHeader('key', 'commands.test')
            .expect(200)
            .send();

        const data = await reponse.getData();

        console.log(data);
    }
}   