/* eslint-disable @typescript-eslint/no-floating-promises */
import { ClientConnection } from 'message-event-channel';
import { HttpMethod } from './HttpClient';
import { Users } from './Users';

describe('Users', () => {
  let connection: ClientConnection;
  let users: Users;

  beforeEach(() => {
    connection = new ClientConnection();
    users = new Users(connection);
  });

  it('should return a list of users', async () => {
    const request = jest.spyOn(connection, 'request').mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            id: '7078e5e7-d5bf-4015-4832-b75fb6f60537',
            type: 'users',
            attributes: {
              email: 'testuser@bigcontent.io',
              'first-name': 'Test',
              'last-name': 'User',
              status: 'ACTIVE',
            },
            links: {
              self: '{AUTH}/users/7078e5e7-d5bf-4015-4832-b75fb6f60537',
            },
          },
        ],
        links: {
          self: '{AUTH}/users',
        },
      },
    });
    const response = await users.list();

    expect(request).toHaveBeenCalledWith('dc-management-sdk-js:request', {
      url: 'https://auth.amplience.net/users',
      method: HttpMethod.GET,
      headers: undefined,
      data: undefined,
    });

    expect(response).toEqual([
      {
        id: '7078e5e7-d5bf-4015-4832-b75fb6f60537',
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@bigcontent.io',
      },
    ]);
  });

  it('should return an empty user list', async () => {
    const request = jest.spyOn(connection, 'request').mockResolvedValue({
      status: 200,
      data: {
        data: [],
        links: {
          self: '{AUTH}/users',
        },
      },
    });
    const response = await users.list();

    expect(request).toHaveBeenCalledWith('dc-management-sdk-js:request', {
      url: 'https://auth.amplience.net/users',
      method: HttpMethod.GET,
      headers: undefined,
      data: undefined,
    });

    expect(response).toEqual([]);
  });

  it('should throw an error', async () => {
    const request = jest.spyOn(connection, 'request').mockRejectedValue({
      status: 401,
    });
    await expect(users.list()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to get users: API responded with a non 200 status code. Error: status code 401"`
    );
  });

  it('should return a permissions', async () => {
    const request = jest.spyOn(connection, 'request').mockResolvedValue({
      status: 200,
      data: {
        data: {
          type: 'permissions',
          attributes: {
            permissions: [],
          },
        },
        meta: {
          principal: {
            'user-id': 'd12ac106-5f27-0000-0000-000000000000',
            'company-id': '9462ee13-5f3f-0000-0000-000000000000',
          },
          'default-bucket': '639f1a61-e5fd-0000-0000-000000000000',
          'refresh-token-expires': '28796',
          'access-token-expires': '356',
          'is-client': false,
        },
      },
    });

    const response = await Object.getPrototypeOf(users).getPermissions.apply(users);

    expect(request).toHaveBeenCalledWith('dc-management-sdk-js:request', {
      url: 'https://auth.amplience.net/permissions',
      method: HttpMethod.GET,
      headers: undefined,
      data: undefined,
    });

    expect(response).toEqual({
      data: {
        type: 'permissions',
        attributes: {
          permissions: [],
        },
      },
      meta: {
        principal: {
          'user-id': 'd12ac106-5f27-0000-0000-000000000000',
          'company-id': '9462ee13-5f3f-0000-0000-000000000000',
        },
        'default-bucket': '639f1a61-e5fd-0000-0000-000000000000',
        'refresh-token-expires': '28796',
        'access-token-expires': '356',
        'is-client': false,
      },
    });
  });

  it('should throw an error on permissions', async () => {
    const request = jest.spyOn(connection, 'request').mockRejectedValue({
      status: 401,
    });
    const usersProto = Object.getPrototypeOf(users);

    await expect(usersProto.getPermissions.apply(users)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to get permissions: API responded with a non 200 status code. Error: status code 401"`
    );
  });

  it('should throw an error on currentUser', async () => {
    const request = jest.spyOn(connection, 'request').mockRejectedValue({
      status: 401,
    });

    await expect(users.currentUser()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to get current user: Unable to get permissions: API responded with a non 200 status code. Error: status code 401"`
    );
  });

  it('should reject a current users', async () => {
    const requestPermissions = jest.spyOn(connection, 'request').mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          type: 'permissions',
          attributes: {
            permissions: [],
          },
        },
        meta: {
          principal: {
            'user-id': 'd12ac106-5f27-0000-0000-000000000000',
            'company-id': '9462ee13-5f3f-0000-0000-000000000000',
          },
          'default-bucket': '639f1a61-e5fd-0000-0000-000000000000',
          'refresh-token-expires': '28796',
          'access-token-expires': '356',
          'is-client': false,
        },
      },
    });
    const requestUser = jest.spyOn(connection, 'request').mockRejectedValue({
      status: 401,
    });

    await expect(users.currentUser()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to get current user: API responded with a non 200 status code. Error: status code 401"`
    );
  });

  it('should return a current users', async () => {
    const requestPermissions = jest.spyOn(connection, 'request').mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          type: 'permissions',
          attributes: {
            permissions: [],
          },
        },
        meta: {
          principal: {
            'user-id': 'd12ac106-5f27-0000-0000-000000000000',
            'company-id': '9462ee13-5f3f-0000-0000-000000000000',
          },
          'default-bucket': '639f1a61-e5fd-0000-0000-000000000000',
          'refresh-token-expires': '28796',
          'access-token-expires': '356',
          'is-client': false,
        },
      },
    });
    const requestUser = jest.spyOn(connection, 'request').mockResolvedValueOnce({
      status: 200,
      data: {
        id: 'd12ac106-5f27-0000-0000-000000000000',
        type: 'users',
        attributes: {
          email: 'testuser@bigcontent.io',
          'first-name': 'Test',
          'last-name': 'User',
          status: 'ACTIVE',
        },
        links: {
          self: '{AUTH}/users/d12ac106-5f27-0000-0000-000000000000',
        },
      },
    });
    const response = await users.currentUser();

    expect(requestUser).toHaveBeenCalled();

    expect(response).toEqual({
      id: 'd12ac106-5f27-0000-0000-000000000000',
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@bigcontent.io',
    });
  });
});
