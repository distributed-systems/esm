import Command from './Command.mjs';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import HTTP2Client from '../es-modules/distributed-systems/http2-client/x/src/HTTP2Client.mjs';


const { promises: {readFile}} = fs; 

    

export default class RemoteCommand extends Command {



    constructor(...parameters) {
        super(...parameters);

        this.httpClient = new HTTP2Client();
        this.httpClient.host('https://localhost:4466');
    }




    /**
     * load the certificate
     *
     * @return     {Promise}  undefined
     */
    async load() {
        const certificate = await readFile(path.join(this.cli.rootDir, 'data/certificate/localhost-certificate.pem'));
        this.httpClient.ca(certificate);
    }




    /**
     * make sure the esm server is running
     *
     * @return     {Promise}  undefined
     */
    async startServer() {
        return new Promise((resolve, reject) => {
            exec('esm-server', (err) => {
                if (err) reject(err);
                else resolve();
            })
        });
    }
}