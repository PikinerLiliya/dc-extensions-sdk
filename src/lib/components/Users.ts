import { ClientConnection } from 'message-event-channel';
import { USERS_PERMISSIONS_URL, USERS_URL, USERS_BY_ID_URL } from '../constants/Users';
import { HttpClient, HttpMethod, HttpResponse } from './HttpClient';

interface AuthUser {
  id: string;
  attributes: {
    email: string;
    'first-name': string;
    'last-name': string;
  };
}

interface AuthUserResponse {
  data: AuthUser[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Meta {
  principal: {
    'user-id': string;
    'company-id': string;
  };
  'default-bucket': string;
  'refresh-token-expires': string;
  'access-token-expires': string;
  'is-client': boolean;
}

interface Permissions {
  data: {
    type: string;
    attributes: any;
  };
  meta: Meta;
}

export class Users {
  private client: HttpClient;

  constructor(private connection: ClientConnection) {
    this.client = new HttpClient(connection);
  }

  async list(): Promise<User[]> {
    try {
      const response: HttpResponse = await this.client.request({
        url: USERS_URL,
        method: HttpMethod.GET,
      });

      if (response.status !== 200) {
        throw new Error(
          `API responded with a non 200 status code. Error: ${
            response.data || `status code ${response.status}`
          }`
        );
      }

      return (
        ((response?.data as unknown) as AuthUserResponse)?.data?.map((user) =>
          this.transformUser(user)
        ) || []
      );
    } catch (error) {
      throw new Error(`Unable to get users: ${error.message}`);
    }
  }

  private async getPermissions(): Promise<Permissions> {
    try {
      const response: HttpResponse = await this.client.request({
        url: USERS_PERMISSIONS_URL,
        method: HttpMethod.GET,
      });

      if (response.status !== 200) {
        throw new Error(
          `API responded with a non 200 status code. Error: ${
            response.data || `status code ${response.status}`
          }`
        );
      }

      return (response?.data as unknown) as Permissions;
    } catch (error) {
      throw new Error(`Unable to get permissions: ${error.message}`);
    }
  }

  async currentUser(): Promise<User> {
    try {
      const { meta } = await this.getPermissions();

      const response: HttpResponse = await this.client.request({
        url: `${USERS_BY_ID_URL}/${meta.principal['user-id']}`,
        method: HttpMethod.GET,
      });

      if (response.status !== 200) {
        throw new Error(
          `API responded with a non 200 status code. Error: ${
            response.data || `status code ${response.status}`
          }`
        );
      }

      return this.transformUser((response?.data as unknown) as AuthUser);
    } catch (error) {
      throw new Error(`Unable to get current user: ${error.message}`);
    }
  }

  private transformUser(authUser: AuthUser): User {
    return {
      id: authUser.id,
      firstName: authUser.attributes['first-name'],
      lastName: authUser.attributes['last-name'],
      email: authUser.attributes.email,
    };
  }
}
