'use strict';

import section from 'section-tests';
import Command from '../src/Command.mjs';
import assert from 'assert';


section('ESM CLI Command', (section) => {
    section('Basics', (section) => {
        section.test('Instantiate Command', async () => {
            new Command({});
        });


        section.test('set & get name', async () => {
            const command = new Command({
                name: '1'
            });

            assert.equal(command.getName(), '1');
            command.setName('2');
            assert.equal(command.getName(), '2');
        });
    });
});