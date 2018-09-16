

/**
 * basic abstraction for creating commands
 */
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



    /**
     * sets the commands name
     *
     * @param      {string}  name    The name
     */
    setName(name) {
        this.name = name;
    }



    /**
     * returns the commands name
     *
     * @return     {string}  The name.
     */
    getName() {
        return this.name;
    }



    /**
     * the load method call is executed before the command is executed, this
     * allows it to load additional required data
     *
     * @return     {Promise}  { description_of_the_return_value }
     */
    async load() {}



    /**
     * lets you terminate stuff after the command was executed
     *
     * @return     {Promise}  { description_of_the_return_value }
     */
    async end() {}
}
