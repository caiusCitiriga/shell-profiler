import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as request from 'request';

import { GENERAL } from '../configs/general.configs';

import { PersistanceItemType } from '../enums/persistance-item-type.enum';

import { ProfilerData } from '../entities/ProfilerData.entity';
import { ProfilerAuth } from '../entities/ProfilerAtuh.entity';
import { LoadGistResult } from '../entities/LoadGistResult.entity';
import { ListGistsResult } from '../entities/ListGistsResult.entity';
import { UpdateGistResult } from '../entities/UpdateGistResult.entity';
import { GistCreationResult } from '../entities/GistCreationResult.entity';

import { UI } from './ui.service';
import { PersistanceService } from './persisance.service';

export class GitHubService {

    public token: string;

    private userGistsUri = 'https://api.github.com/users/';
    private gistsUri = 'https://api.github.com/gists';

    private _$gistsListResult: Subject<ListGistsResult> = new Subject();
    private _$gistsLoadResult: Subject<LoadGistResult> = new Subject();
    private _$gistUpdateResult: Subject<UpdateGistResult> = new Subject();
    private _$gistCreationResult: Subject<GistCreationResult> = new Subject();

    public listGists(): Observable<ListGistsResult> {
        const githubUsername = this.getGitHubUsername();
        if (!githubUsername) {
            return Observable.of({ status: 999, data: null, error: 'missing-username' });
        }

        request({
            method: 'GET',
            headers: {
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            },
            uri: this.userGistsUri + githubUsername + '/gists'
        }, (error, response: any, body) => {
            if (error) {
                console.log('There was an error sending the list profiles request');
                console.log(error);
                this._$gistsListResult.next({ status: 999, data: null, error: error });
            }

            const data = <any[]>JSON.parse(response['body']);
            const gists: any[] = [];
            data.forEach(gist => {
                if (gist.description === GENERAL.gistDescription) {
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

    public loadGist(url: string): Observable<LoadGistResult> {
        request({
            method: 'GET',
            uri: url,
            headers: {
                'user-agent': 'https://github.com/ShellProfiler/shell-profiler'
            }
        }, (error, response, body) => {
            if (error) {
                console.log('There was an error loading the profile');
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

    public createGist(filename: string, profile: ProfilerData): Observable<any> {
        this.token = <string>(<ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData)).githubToken;

        const body = {
            description: GENERAL.gistDescription,
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
        }, (error, response: any, body) => {
            if (error) {
                UI.error('There was an error creating the profile');
                UI.error(error);
                this._$gistCreationResult.next({ status: 999, data: null, error: error });
                return;
            }

            if (response.statusCode === 401) {
                UI.error('Not authorized!');
                this._$gistCreationResult.next({ status: 401, data: null, error: body.message });
                return;
            }

            if (response.statusCode === 422) {
                UI.error(body.message);
                this._$gistCreationResult.next({ status: 422, data: null, error: body.message });
                return;
            }

            if (response.statusCode === 201) {
                this._$gistCreationResult.next({ status: 201, data: response['body'] });
                return;
            }
        });

        return this._$gistCreationResult.asObservable();
    }

    public updateGist(profile: ProfilerData, gistId: string): Observable<LoadGistResult> {
        this.token = <string>(<ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData)).githubToken;

        const body = {
            description: GENERAL.gistDescription,
            public: true,
            files: {
                [<string>profile.name + GENERAL.gistFileExt]: {
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
        },
            (error, response, body) => {
                if (error) {
                    console.log('Error while updating gist');
                    console.log(error);
                    this._$gistsLoadResult.next({ status: 999, data: null, error: error });
                    return;
                }

                if (response.statusCode) {
                    UI.success('In sync.');
                }

                this._$gistsLoadResult.next({ status: 200, data: response['body'] });
            });

        return this._$gistsLoadResult.asObservable();
    }

    private getGitHubUsername(): string | null {
        const githubUsername = (<ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData)).githubUsername;
        if (!githubUsername) {
            UI.error('No GitHub username found, please run the set --username command');
            return null;
        }
        return githubUsername;
    }
}