'use strict';

import path from 'path';
import fs from 'fs';


const {promises: {readdir, stat}} = fs;



/**
* The CLIParser class is used to handle command line 
* interface related parsing jobs like getting the 
* command to be executed and the bash completion
*/


export default class CLIParser {

    /**
    * @param {array} [args=process.argv]       command line parameters
    */
    constructor({
        args = process.argv
    } = {}) {
        this.args = args;
    }




    /**
    * do bash path completions based on the users input
    *
    * @param {string} input                 the users input that shall be auto completed
    * @param {boolean} [onlyFolders=false]  set to true if only folders shall be auto completed  
    *
    * @returns {string} a line separated list of options available to the user
    */
    async getPathCompletion(input, onlyFolders = false) {
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

        // return full paths
        files = files.filter(file => file !== null).map((file) => {
            return basePath+file;
        });

        // filter & convert array to line separated items
        return this.getCompletion(files);
    }




    /**
    * returns the first argument passed to esm, which is the command 
    * to execute
    */
    getCommand() {
        return this.args[2];
    }




    /**
    * get the word at a specific index, starting after the command
    */
    getWordAtIndex(index) {
        return this.args[5+index];
    }



    /**
    * get the current word index
    */
    getWordIndex() {
        return parseInt(this.args[3], 10);
    }



    /**
    * get the command line
    */
    getLine() {
        return this.args[4];
    }



    /**
    * get all words
    */
    getWords() {
        return this.args.slice(6);
    }



    /**
    * return all arguments after the command
    */
    getArguments(index) {
        if (index !== undefined) return this.args[3+index];
        else return this.args.slice(3);
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