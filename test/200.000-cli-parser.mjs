'use strict';

import section from 'section-tests';
import CLIParser from '../src/CLIParser.mjs';
import assert from 'assert';


section('ESM CLI Parser', (section) => {
    section('Basics', (section) => {
        section.test('Instantiate Parser', async () => {
            new CLIParser();
        });


        section.test('Get a path completion for a relative path', async () => {
            const args = [1, 2, 3, 'complete', 1, 'complete test/completion/a', 'complete', 'test/completion/a'];
            const parser = new CLIParser({args});

            const completions = await parser.getPathCompletion('test/completion/a', false);
            assert(completions);

            const items = completions.split('\n');
            assert.equal(items.length, 2);
            assert.equal(items[0].trim(), 'test/completion/a-good-file.js');
            assert.equal(items[1].trim(), 'test/completion/a-unused-folder/');
        });



        section.test('Get a path completion for an absolute path', async () => {
            const args = [1, 2, 3, 'complete', 1, 'complete /h', 'complete', '/h'];
            const parser = new CLIParser({args});

            const completions = await parser.getPathCompletion('/h', false);
            assert(completions);

            const items = completions.split('\n');
            assert.equal(items.length, 1);
            assert.equal(items[0].trim(), '/home/');
        });



        section.test('Get the command from the CLI', async () => {
            const args = [1, 2, 'complete'];
            const parser = new CLIParser({args});

            const command = await parser.getCommand();
            assert(command);
            assert.equal(command, 'complete');
        });
    });
});