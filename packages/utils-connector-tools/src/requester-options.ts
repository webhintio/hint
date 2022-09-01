import * as fetch from 'node-fetch';

export interface IRequestOptions extends fetch.RequestInit {
  rejectUnauthorized?: boolean;
  strictSSL?: boolean;
}
