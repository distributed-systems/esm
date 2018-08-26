'use strict';


import Command from '../Command.mjs';
import path from 'path';
import fs from 'fs';
import{promisify} from 'util';


const stat = promisify(fs.stat);



export default class LinkCommand extends Command {
     constructor(options) {
        super(options);

        this.setName('link');
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
        if (wordIndex === 1) {
            return await this.parser.getPathCompletion(words[0], true);
        }
    }






    /**
    * link the target module into the target module
    */
    async execute() {
        const userPath = this.parser.getArguments(0) || ''; 
        const sourcePath = userPath.startsWith('/') ? userPath : path.join(process.cwd(), userPath);
        const stats = await stat(sourcePath);

        console.log(stats, sourcePath);
    }
}   