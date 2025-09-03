import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GithubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  blog: string;
  location: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class Github {
  private base = 'https://api.github.com/users';

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`${this.base}/${username}`);
  }
}
