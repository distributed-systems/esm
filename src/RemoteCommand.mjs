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





    async end() {
        await this.httpClient.end();
    }




    /**
     * checks if the esm server is online in order to prevent process creation
     *
     * @return     {Promise}  true if the server is online, false otherwise
     */
    async probeServer() {
        try {
            const response = await this.httpClient
                .get(`/esm-status`)
                .send();

            if (response && response.status(200)) {
                const data = await response.getData();
                return data && data.loaded;
            } else return false;
        } catch(e) {
            return false;
        }
    }




    /**
     * make sure the esm server is running
     *
     * @return     {Promise}  undefined
     */
    async startServer() {
        const isRunning = await this.probeServer();

        if (!isRunning) {
            return new Promise((resolve, reject) => {
                exec('esm-server', (err, stdout, stderr) => {
                    // console.log(err, stdout, stderr);
                    if (err) reject(err);
                    else resolve();
                })
            });
        }
    }
}