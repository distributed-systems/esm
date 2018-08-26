'use strict';


export default class Output {



    /**
    * exit the process with an error
    */
    fail(message, code = 1) {
        console.error(message);
        process.exit(code);
    }
}