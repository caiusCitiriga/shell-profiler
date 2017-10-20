"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Subject_1 = require("rxjs/Subject");
const Observable_1 = require("rxjs/Observable");
const request = require("request");
const general_configs_1 = require("../configs/general.configs");
const persistance_item_type_enum_1 = require("../enums/persistance-item-type.enum");
const ui_service_1 = require("./ui.service");
const persisance_service_1 = require("./persisance.service");
class GitHubService {
    constructor() {
        this.userGistsUri = 'https://api.github.com/users/';
        this.gistsUri = 'https://api.github.com/gists';
        this._$gistsListResult = new Subject_1.Subject();
        this._$gistsLoadResult = new Subject_1.Subject();
        this._$gistUpdateResult = new Subject_1.Subject();
        this._$gistCreationResult = new Subject_1.Subject();
        this.token = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.authData).githubToken;
    }
    listGists() {
        const githubUsername = this.getGitHubUsername();
        if (!githubUsername) {
            return Observable_1.Observable.of({ status: 999, data: null, error: 'missing-username' });
        }
        request({
            method: 'GET',
            headers: {
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            },
            uri: this.userGistsUri + githubUsername + '/gists'
        }, (error, response, body) => {
            if (error) {
                console.log('There was an error sending the list gists request');
                console.log(error);
                this._$gistsListResult.next({ status: 999, data: null, error: error });
            }
            const data = JSON.parse(response['body']);
            const gists = [];
            data.forEach(gist => {
                if (gist.description === general_configs_1.GENERAL.gistDescription) {
                    gists.push(gist);
                }
            });
            if (!gists.length) {
                this._$gistsListResult.next({ status: 200, data: null });
                return;
            }
            this._$gistsListResult.next({ status: 200, data: gists });
        });
        return this._$gistsListResult.asObservable();
    }
    loadGist(url) {
        request({
            method: 'GET',
            uri: url,
            headers: {
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            }
        }, (error, response, body) => {
            if (error) {
                console.log('There was an error loading the gist');
                console.log(error);
                this._$gistsLoadResult.next({ status: 999, data: null, error: error });
                return;
            }
            //  Handle profile load here.
            this._$gistsLoadResult.next({ status: 200, data: response['body'] });
            return;
        });
        return this._$gistsLoadResult.asObservable();
    }
    createGist(filename, profile) {
        const body = {
            description: general_configs_1.GENERAL.gistDescription,
            public: true,
            files: {
                [filename]: {
                    content: JSON.stringify(profile)
                }
            }
        };
        request({
            method: 'POST',
            uri: this.gistsUri,
            json: true,
            body: body,
            headers: {
                'Authorization': `token ${this.token}`,
                'user-agent': 'https://github.com/BashProfiler/profiler-cli'
            }
        }, (error, response, body) => {
            if (error) {
                console.log('There was an error creating the gist');
                console.log(error);
                this._$gistCreationResult.next({ status: 999, data: null, error: error });
                return;
            }
            if (response.statusCode === 401) {
                console.log('NOT Authorized');
                console.log(body.message);
                this._$gistCreationResult.next({ status: 401, data: null, error: body.message });
                return;
            }
            if (response.statusCode === 422) {
                console.log('Unprocessable entity');
                console.log(body.message);
                this._$gistCreationResult.next({ status: 422, data: null, error: body.message });
                return;
            }
            if (response.statusCode === 201) {
                console.log('Success!');
                this._$gistCreationResult.next({ status: 201, data: response['body'] });
                return;
            }
        });
        return this._$gistCreationResult.asObservable();
    }
    updateGist(profile, gistId) {
        const body = {
            description: general_configs_1.GENERAL.gistDescription,
            public: true,
            files: {
                [profile.name + general_configs_1.GENERAL.gistFileExt]: {
                    content: JSON.stringify(profile)
                }
            }
        };
        request({
            method: 'PATCH',
            uri: `${this.gistsUri}/${gistId}`,
            json: true,
            body: body,
            headers: {
                'Authorization': `token ${this.token}`,
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            }
        }, (error, response, body) => {
            if (error) {
                console.log('Error while updating gist');
                console.log(error);
                this._$gistsLoadResult.next({ status: 999, data: null, error: error });
                return;
            }
            console.log(response.statusCode);
            this._$gistsLoadResult.next({ status: 200, data: response['body'] });
        });
        return this._$gistsLoadResult.asObservable();
    }
    getGitHubUsername() {
        const githubUsername = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.authData).githubUsername;
        if (!githubUsername) {
            ui_service_1.UI.error('No GitHub username found, please run the set --username command');
            return null;
        }
        return githubUsername;
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.service.js.map