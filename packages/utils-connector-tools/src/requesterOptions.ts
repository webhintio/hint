import * as fetch from 'node-fetch';

export interface IRequestOptions extends fetch.RequestInit {
  maxRedirects?: number;
}
