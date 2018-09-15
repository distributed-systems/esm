import Command from '../Command.mjs';
import path from 'path';
import fs from 'fs';


const { promises: { stat } } = fs;



export default class LinkCommand extends Command {
    constructor(options) {
        super(options);

        this.setName('link');
    }


    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm link source-path`,
            short: `links the dependency from source-path to the current projects es-modules folder`,
            description: ``,
            examples: [{
                syntax: `esm link ../http2-server`,
                short: `links the http2-server library to the current projects esm folder`,
            }]
        }
    }



    /**
    * get command auto complete words
    */
    async getCompletion(words, wordIndex) {
        if (wordIndex === 1) {
            return await this.parser.getPathCompletion(words[0], true);
        }
    }




    /**
     * make sure the esm server is running
     *
     * @return     {Promise}  undefined
     */
    async startServer() {
        return new Promise((resolve, reject) => {
            exec('esm-server', (err) => {
                if (err) reject(err);
                else resolve();
            })
        });
    }




    /**
    * link the target module into the target module
    */
    async execute() {
        const userPath = this.parser.getArguments(0) || ''; 
        const sourcePath = userPath.startsWith('/') ? userPath : path.join(process.cwd(), userPath);
        const stats = await stat(sourcePath);

        await this.startServer();

        console.log(stats, sourcePath);
    }
}   