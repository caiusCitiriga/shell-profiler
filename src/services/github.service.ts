import * as request from 'request';

import { GENERAL } from '../configs/general.configs';
import { ProfilerData } from '../entities/ProfilerData.entity';

export class GitHubService {

    public token: string = 'eb-3b-a9-52-28-40-ff-9c-2e-1d-d4-26-ce-d2-51-d2-93-e3-33-be';
    private githubUsername: string;

    private gistId: string;
    private gistName: string;

    private userApiUri: string;
    private gistsApiUri: string;

    public constructor() {
        let sanitizedTkn = '';
        this.token.split('-').forEach(c => {
            sanitizedTkn += c;
        });
        this.token = sanitizedTkn;
    }

    private listGists() {
        request({
            method: 'GET',
            headers: {
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            },
            uri: this.userApiUri + this.githubUsername + '/gists'
        }, (error, response: any, body) => {
            if (error) {
                console.log('There was an error sending the list gists request');
                console.log(error);
                return;
            }

            const data = <any[]>JSON.parse(response['body']);
            const gists: any[] = [];
            data.forEach(gist => {
                if (gist.description === GENERAL.gistDescription) {
                    gists.push(gist);
                }
            });

            if (!gists.length) {
                //  Ask user input here
                //this.createGist(GENERAL.gistDesc, `${name}.${GENERAL.gistFileExt}`, new ProfilerData());
                return;
            }

            gists.forEach((g, i) => {
                const filename = Object.keys(g.files)[0].split('.')[0];
                console.log(`${i}) ${filename}`);
            });

            //  If there are multitple valid gists, ask the user which one he wants to use presenting all the gists
        });
    }

    private loadGist(url: string) {
        request(url, {}, (error, response, body) => {
            if (error) {
                console.log('There was an error loading the gist');
                console.log(error);
                return;
            }

            //  Handle profile load here.
            return;
        });
    }

    private createGist(desc: string, filename: string, profile: ProfilerData) {
        const body = {
            description: desc,
            public: true,
            files: {
                [filename]: {
                    content: JSON.stringify(profile)
                }
            }
        };

        request({
            method: 'POST',
            uri: this.gistsApiUri,
            json: true,
            body: body,
            headers: {
                'Authorization': `token ${this.token}`,
                'user-agent': 'https://github.com/BashProfiler/profiler-cli'
            }
        }, (error, response: any, body) => {
            if (error) {
                console.log('There was an error creating the gist');
                console.log(error);
            }

            if (response.statusCode === 401) {
                console.log('NOT Authorized');
                console.log(body.message);
                return;
            }

            if (response.statusCode === 422) {
                console.log('Unprocessable entity');
                console.log(body.message);
                return;
            }

            if (response.statusCode === 201) {
                //  Handle gist successfull creation
                //  Set the gist name here and save it too
            }
        });
    }

    private updateGist(profile: ProfilerData) {
        if (!this.gistId) {
            console.log('The gist ID is missing. This might mean that you have to create a new gist or take one available on GitHub');
            return;
        }

        const body = {
            description: GENERAL.gistDescription,
            public: true,
            files: {
                [this.gistName]: {
                    content: JSON.stringify(profile)
                }
            }
        };
        request({
            method: 'PATCH',
            uri: `${this.gistsApiUri}/${this.gistId}`,
            json: true,
            body: body,
            headers: {
                'Authorization': `token ${this.token}`,
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            }
        },
            (error, response, body) => {
                if (error) {
                    console.log('Error while updating gist');
                    console.log(error);
                    return;
                }

                console.log(response.statusCode);
            });
    }
}