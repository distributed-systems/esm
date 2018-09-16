import RemoteCommand from '../RemoteCommand.mjs';
import path from 'path';
import fs from 'fs';
import os from 'os';


const { promises: {
    stat,
    readFile,
    writeFile,
    readdir,
    mkdir,
    rmdir,
    unlink,
} } = fs;



export default class NPMConvertCommand extends RemoteCommand {
     constructor(options) {
        super(options);

        // regular expression used to convert imports
        this.reg = /(?<prefix>import\s+[\{\},\sa-z0-9_@]+\s+from\s+['"])[^'"]+(es-modules\/)(?<vendor>[^\/'"]+)\/(?:@(?<npmVendor>[^\/"'+]+)\+(?<npmPackage>[^\/"']+)|(?<moduleName>[^\/'"]+))\/(?<version>[^\/'"]+)\/(?<file>[^'"]+)(?<quote>['"])/gi;

        this.setName('npm-convert');
    }





    /**
    * get command help information
    */
    getHelp() {
        return {
            syntax: `esm npm-convert`,
            short: `convert the source code to an npm compatible format and put it in the npm folder`,
            description: ``,
            examples: [{
                syntax: `esm npm-convert`,
                short: `conver the source code`,
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
    * get the configuration, convert the sources
    */
    async execute() {
        await this.startServer();

        const response = await this.httpClient
            .get('/module-yml')
            .setHeader('module', process.cwd())
            .setHeader('key', 'npm-convert')
            .send().catch(console.log);

        const data = await response.getData();

        if (response.status(404)) {
            console.warn(data.message);
        } else if (response.status(200)) {
            await this.convert(data.value);
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
    async convert(config) {
        if (!config) {
            console.warn(`Missing 'npm-convert' configuration in the module.yml`);
        } else if (!config.source || !Array.isArray(config.source)) {
            console.log(`Missing 'npm-convert.source' entry configuration in the module.yml`);
        } else if (!config.destination) {
            console.log(`Missing 'npm-convert.destination' entry configuration in the module.yml`);
        } else {
            const mapping = new Map();

            if (config.mapping) {
                Object.keys(config.mapping).forEach((key) => {
                    mapping.set(key, config.mapping[key]);
                });
            }


            // remove the target dir
            const baseDir = process.cwd();
            await this.resetTargetDir(path.join(baseDir, config.destination));


            // import all files
            for (const fileOrDir of config.source) {
                await this.convertFileorDirectory(baseDir, config.destination, fileOrDir, mapping);
            }
        }
    }






    /**
     * recreate the target dir, make sure its the right one
     *
     * @param      {<type>}   targetDir  The target dir
     * @return     {Promise}  undefined
     */
    async resetTargetDir(targetDir) {
        let stats;
        const esmFilePath = path.join(targetDir, '.esm');

        try {
            stats = await stat(targetDir);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw new Error(`Cannot reset target directory ${targetDir}: ${err.message}`);
            }
        }


        // check if the existing dir can be safely removed
        if (stats) {
            if (stats.isDirectory()) {
                let stats;

                // probe for the .esm file
                try {
                    stats = await stat(esmFilePath);
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        throw new Error(`Cannot reset target directory ${targetDir}: missing the .esm file in it!`);
                    } else {
                        throw new Error(`Cannot reset target directory ${targetDir}, failed to stat the .esm file: ${err.message}`);
                    }
                }

                if (stats.isFile()) {
                    await this.deleteRecursive(targetDir);
                } else {
                    throw new Error(`Cannot reset target directory ${targetDir}, the .esm file is not a regular file!`);
                }
            } else {
                throw new Error(`Cannot reset target directory ${targetDir}: the path exists but is not a directory!`);
            }
        }


        // create the dir
        await mkdir(targetDir);

        // add the .esm file
        await writeFile(esmFilePath, 'Created by «esm npm-convert». Do not remove! esm cannot delete this directory without this file!');
    }





    /**
     * converts the sources int eh specified path
     *
     * @param      {<type>}   baseDir      The base dir
     * @param      {<type>}   destination  The destination
     * @param      {<type>}   sourcePath   The source path
     * @param      {<type>}   mapping      The mapping
     * @return     {Promise}  { description_of_the_return_value }
     */
    async convertFileorDirectory(baseDir, destination, sourcePath, mapping) {
        let stats;
        const currentPath = path.join(baseDir, sourcePath);

        try {
            stats = await stat(currentPath);
        } catch (err) {
            console.warn(`Failed to convert ${sourcePath}: ${err.message}`);
            return;
        }


        if (stats && stats.isDirectory()) {
            const files = await readdir(currentPath);

            for (const file of files) {
                await this.convertFileorDirectory(baseDir, destination, path.join(sourcePath, file), mapping);
            }
        } else if (stats && stats.isFile()) {
            if (sourcePath.endsWith('.mjs') || sourcePath.endsWith('.js')) {
                const source = await readFile(currentPath);

                console.log(`▶ ${this.blue(sourcePath)} => ${this.orange(path.join(destination, sourcePath))}`);

                const convertedFile = this.convertFile(source.toString(), mapping);
                await this.saveFile(baseDir, destination, sourcePath, convertedFile);
            }
        } else {
            console.warn(`Failed to convert ${sourcePath}: path is not a file or a directory!`);
        }
    }





    /**
     * save the converted file at the destination
     *
     * @param      {string}   baseDir       The base dir
     * @param      {string}   destination   The destination
     * @param      {string}   sourcePath    The source path
     * @param      {string}   source        source code
     * @return     {Promise}  undefiend
     */
    async saveFile(baseDir, destination, sourcePath, source) {

        // make sure the path exists
        await this.makeDir(baseDir, path.dirname(path.join(destination, sourcePath)).split('/'));

        // save the file at the destination
        const targetPath = path.join(baseDir, destination, sourcePath);
        await writeFile(targetPath, source);
    }






    /**
     * remove all files and directories from a directory
     *
     * @param      {string}   targetPath  The target path
     * @return     {Promise}  undefined
     */
    async deleteRecursive(targetPath) {
        let stats;

        try {
            stats = await stat(targetPath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw new Error(`Cannot delete path ${targetPath}: ${err.message}`);
            }
        }


        if (stats) {
            if (stats.isDirectory()) {
                const files = await readdir(targetPath);

                for (const file of files) {
                    await this.deleteRecursive(path.join(targetPath, file));
                }

                await rmdir(targetPath);
            } else if (stats.isFile()) {
                await unlink(targetPath);
            }
        }
    }






    /**
     * recursive creates directories
     *
     * @param      {string}   baseDir    the base dir to start in
     * @param      {array}    targetDir  the target path parts to create
     * @param      {number}   index      the current index of th target dir array
     * @return     {Promise}  undefined
     */
    async makeDir(baseDir, targetDir, index = 1) {
        if (index > targetDir.length) return;
        const currentDir = path.join(baseDir, targetDir.slice(0, index).join(path.sep));
        let stats;

        try {
            stats = await stat(currentDir);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await mkdir(currentDir);
                await this.makeDir(baseDir, targetDir, index + 1);
                return;
            } else {
                throw new Error(`Cannot create directory ${currentDir}: ${err.message}`);
            }
        }

        if (stats.isDirectory()) {
            await this.makeDir(baseDir, targetDir, index + 1);
        } else {
            throw new Error(`Cannot create directory ${currentDir}: the path exists but is not a directory!`);
        }
    }






    orange(str){
        return `\u{1b}[0;96m${str}\u{1b}[0m`;
    }

    blue(str){
        return `\u{1b}[0;32m${str}\u{1b}[0m`;
    }



    /**
     * convert a single source file
     */
    convertFile(source, mapping) {
        this.reg.lastIndex = 0;

        const result = this.reg.exec(source);

        if (result) {
            const {
                prefix,
                vendor,
                npmVendor,
                npmPackage,
                moduleName,
                version,
                file,
                quote,
            } = result.groups;

            let replacement = prefix;

            // the npm namespace is a reference to modules that are only available
            // on npm and are automatically converted to the esm system
            if (vendor === 'npm') {
                if (npmVendor) {

                    // prefixed module
                    replacement += `@${npmVendor}/${npmPackage}`;
                } else {
                    replacement += moduleName;
                }
            } else {
                const ourName = `${vendor}/${moduleName}`;

                // check for user configured module mappings
                if (mapping.has(ourName)) {
                    replacement += mapping.get(ourName);
                } else {
                    replacement += moduleName;
                }
            }

            if (file) replacement += '/' + file;
            replacement += quote;

            console.log(`   ▶ ${this.blue(result[0].substr(prefix.length-1))} => ${this.orange(replacement.substr(prefix.length-1))}`);

            // replace import with new one
            source = source.replace(result[0], replacement);

            // convert the next import until none matches
            return this.convertFile(source, mapping);
        } else {
            return source;
        }
    }
}   