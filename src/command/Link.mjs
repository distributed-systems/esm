import RemoteCommand from '../RemoteCommand.mjs';
import path from 'path';
import fs from 'fs';


const { promises: { stat } } = fs;



export default class LinkCommand extends RemoteCommand {
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
    * link the target module into the target module
    */
    async execute() {
        await this.startServer();

        let userPath = this.parser.getArguments(0) || '';
        if (userPath.endsWith(path.sep)) userPath = userPath.substr(0, userPath.length - 1);

        const targetPath = userPath.startsWith('/') ? userPath : path.join(process.cwd(), userPath);
        const stats = await stat(targetPath);


        if (stats.isDirectory()) {
            const response = await this.httpClient
                .post('/link')
                .expect(201)
                .send({
                    linkFrom: path.normalize(targetPath),
                    linkTo: path.normalize(process.cwd()),
                });

            const data = await response.getData();

        } else {
            throw new Error(`Cannot link '${sourcePaths}': path is not a directory!`);
        }
    }
}   