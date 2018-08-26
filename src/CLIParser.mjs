'use strict';

import path from 'path';
import fs from 'fs';
import{promisify} from 'util';



const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);



export default class CLIParser {
    constructor() {

    }


    /**
    * do path auto completions
    */
    async getPathCompletion(input, onlyFolders = false) {// console.log(`xx${input}xx`)
        const basePath = input.includes('/') ? (input.endsWith('/') ? input : path.dirname(input)+(path.dirname(input).endsWith('/') ? '' : '/')) : '';

        // get an absolute path
        if (!input.startsWith('/')) {
            input = path.join(process.cwd(), input);
        }

        // make sure the readdir hits a directory
        const stats = await stat(input).catch(() => {});
        if (!stats || !stats.isDirectory()) input = path.dirname(input);

        let files = await readdir(input);

        // add slashes for directories
        for (let i = 0, l = files.length; i< l; i++) {
            const stats = await stat(path.join(input, files[i])).catch(() => {});
           
            if (stats && stats.isDirectory()) {
                files[i] += '/';
            } else if (!onlyFolders) {
                files[i] += ' ';
            } else {
                files[i] = null;
            }
        }

        files = files.filter(file => file !== null).map((file) => {
            return basePath+file;
        });
        //console.log(files.join('=='), `0>${basePath}<0`);
        return this.getCompletion(files);
    }


    /**
    * returns the first argumetn passed to esm, which is the command 
    * to execute
    */
    getCommand() {
        return process.argv[2];
    }


    /**
    * get the word at a specific index, starting after the command
    */
    getWordAtIndex(index) {
        return process.argv[5+index];
    }


    /**
    * get the current word index
    */
    getWordIndex() {
        return parseInt(process.argv[3], 10);
    }

    /**
    * get the command line
    */
    getLine() {
        return process.argv[4];
    }

    /**
    * get all words
    */
    getWords() {
        return process.argv.slice(6);
    }


    /**
    * return all arguments after the command
    */
    getArguments(index) {
        if (index !== undefined) return process.argv[3+index];
        else return process.argv.slice(3);
    }


    /**
    * matches input options against he user input in order
    * to provide bash completions
    */
    getCompletion(options = [], addSpace) {
        const items = this.getWords();
        const filterString = items[items.length -1];

        if (addSpace) options = options.map(option => option+=' ');

        return filterString.length ? options.filter(word => word.startsWith(filterString)).join('\n') : options.join('\n');;
    }
}