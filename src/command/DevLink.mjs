import RemoteCommand from '../RemoteCommand.mjs';
import path from 'path';
import fs from 'fs';


const { promises: { stat, mkdir, symlink } } = fs;



export default class LinkCommand extends RemoteCommand {
    constructor(options) {
        super(options);

        this.setName('dev-link');
    }


    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm dev-link source-path`,
            short: `Links the dependency from source-path to the current projects es-modules directory. Links all semver compatible paths. Used for pre-registry dev development only!`,
            description: ``,
            examples: [{
                syntax: `esm dev-link ../http2-server`,
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
     * checks if a path exists
     *
     * @param      {string}   filePath  the path
     * @return     {Promise} 
     */
    async pathExists(filePath) {
        const stats = await stat(filePath).catch(err => null);
        return !!stats;
    }




    /**
     * create a direcotry or a path recurively
     *
     * @param      {string}   filePath   the path to create
     * @param      {boolean}  recursive  Create path recursve
     * @return     {Promise}
     */
    async createDirectory(filePath, recursive = false) {

        // check if the directory exists already
        const exists = await this.pathExists(filePath).catch(err => null);
        if (exists) return;

        const parentDir = path.dirname(filePath);
        const parentDirExists = await this.pathExists(parentDir);

        // create parent directories 
        if (!parentDirExists) {
            if (recursive) await this.createDirectory(parentDir, recursive);
            else {
                throw new Error(`Cannot create directory '${filePath}', the parent directory '${parentDir}' does not exist!`);
            }
        }

        await mkdir(filePath);
    }






    /**
     * create a symbolic link
     *
     * @param      {string}   from    source path, aka the links name
     * @param      {string}   to      the target to link to
     * @return     {Promise}
     */
    async link(from, to) {
        const exists = await this.pathExists(from); 
        if (!exists) await symlink(to, from, 'dir');
    }





    /**
    * link the target module into the target module
    */
    async execute() {
        let userPath = this.parser.getArguments(0) || '';
        if (userPath.endsWith(path.sep)) userPath = userPath.substr(0, userPath.length - 1);

        const targetPath = userPath.startsWith('/') ? userPath : path.join(process.cwd(), userPath);
        const stats = await stat(targetPath);


        if (targetPath === process.cwd()) {
            // link all modules found the module.yml

            await this.startServer();

            const response = await this.httpClient
                .get('/module-yml')
                .setHeader('module', targetPath)
                .setHeader('key', 'dev-link')
                .send();

            if (response.status(404)) {
                console.log(`The module '${targetPath}' has no dev-links!`);
            } else if (response.status(200)) {
                const links = (await response.getData()).value;

                // discover all dependencies, link all of them
                for (const linkName of links) {
                    let parentDir = path.dirname(process.cwd());

                    // link
                    await this.linkModule(path.join(parentDir, linkName));
                }
            } else {
                throw new Error(`The server returned an unknown status ${response.status()}: ${data.message}`);
            }
        } else {
            // link a specific module

            if (stats.isDirectory()) {
                await this.linkModule(targetPath);
            } else {
                throw new Error(`Cannot link '${sourcePaths}': path is not a directory!`);
            }
        }
    }




    /**
     * create links to a module in the current es-modules dir
     *
     * @param      {string}   targetPath  the module to link
     * @return     {Promise}
     */
    async linkModule(targetPath) {
        await this.startServer();

        const response = await this.httpClient
            .get('/module-yml')
            .setHeader('module', targetPath)
            .send();

        const data = await response.getData();

        if (response.status(200)) {
            const esmDir = path.join(process.cwd(), 'es-modules', data.organization, data.name);

            // create the required directories
            await this.createDirectory(esmDir, true);

            // create links for all versions
            
            // x
            await this.link(path.join(esmDir, 'x'), targetPath);

            // 1.x
            await this.link(path.join(esmDir, data.version.substr(0, 1) + '.x'), targetPath);

            // 1.2.x
            await this.link(path.join(esmDir, data.version.substr(0, 3) + '.x'), targetPath);

            // 1.2.2
            await this.link(path.join(esmDir, data.version), targetPath);

            // 1.2.2+
            await this.link(path.join(esmDir, data.version + '+'), targetPath);
        } else {
            throw new Error(`The server returned an unknown status ${response.status()}: ${data.message}`);
        }
    }
}

