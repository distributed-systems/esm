'use strict';

import section from 'section-tests';
import CLI from '../src/CLI.mjs';
import assert from 'assert';


section('ESM CLI', (section) => {
    section('Basics', (section) => {
        section.test('Instantiate CLI', async () => {
            new CLI();
        });


        section.test('Execute the CLI without command', async () => {
            const args = [];
            const cli = new CLI({args});
            const help = await cli.execute();
            assert(help);
        });


        section.test('Execute the CLI with an invalid command', async () => {
            const args = [1,2,'jona is my name'];
            const cli = new CLI({args});
            const err = await cli.execute().catch(err => Promise.resolve(err));
            assert(err);
            assert.equal(err.message, `Unknown command 'jona is my name'!`);
        });
    });
});