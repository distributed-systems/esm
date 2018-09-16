import RemoteCommand from '../RemoteCommand.mjs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';



/**
 * executes the test command configured in the module.yml
 */
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
    * run the test command
    */
    async execute() {
        await this.startServer();

        const response = await this.httpClient
            .get('/module-yml')
            .setHeader('module', process.cwd())
            .setHeader('key', 'commands.test')
            .send();

        const data = await response.getData();

        if (response.status(404)) {
            console.warn(data.message);
        } else if (response.status(200)) {
            await this.runTest(data.value);
        } else {
            console.log(data);
            throw new Error(`The server returned an unknown status ${response.status()}: ${data.message}`);
        }
    }




    /**
     * execute the test
     *
     * @param      {string}   testCommand  The test command
     * @return     {Promise}  undefined
     */
    async runTest(testCommand) {
        return new Promise((resolve, reject) => {
            const command = testCommand.substr(0, testCommand.indexOf(' '));
            const args = testCommand.substr(testCommand.indexOf(' ')+1).split(' ');

            console.log(`esm test: ${testCommand}`);

            const child = spawn(command, args, {
                cwd: process.cwd(),
                env: process.evn,
                stdio: 'inherit'
            });

            child.on('exit', resolve);
        });
    }
}   