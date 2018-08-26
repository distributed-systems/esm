#!/usr/bin/env node

import os from 'os';
import path from 'path';


class ESM {


    constructor() {
        this.installationDir = path.join(os.homedir(), '.esm');
        this.cliPath = path.join(this.installationDir, 'src/CLI.mjs');
    }




    /**
    * executes the cli
    */
    async execute() {
        let CLIConstructor;

        try {
            const exported  = await import(this.cliPath);
            CLIConstructor = exported.default;
        } catch (e) {
            e.message = `Failed to load the esm cli: ${e.message}`;
            throw e;
        }

        const cli = new CLIConstructor();
        return await cli.execute();
    }




    /**
    * make sure that esm is installed
    */
    async prepare() {
        // TODO: implement this as soon the esm registry becomes available
    }
}




(async () => {
    const esm = new ESM();


    // make sure esm is installed
    await esm.prepare();

    // run the cli
    const result = await esm.execute();

    if (typeof result === 'string') process.stdout.write(result);
})().catch((err) => {
    console.error(err.message);
    process.exit(err.exitCode || 1);
});