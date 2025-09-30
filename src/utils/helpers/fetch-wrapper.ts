import { useAuthStore } from '@/stores/auth';

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
};

interface temp {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface UserData {
  username: string;
  password: string;
}

function request(method: string) {
  return (url: string, body?: object) => {
    const requestOptions: temp = {
      method,
      headers: authHeader(url)
    };
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }
    return fetch(url, requestOptions).then(handleResponse);
  };
}

// helper functions

function authHeader(url: string): Record<string, string> {
  const auth = useAuthStore();
  const isLoggedIn = !!auth.accessToken;
  const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);

  if (isLoggedIn && isApiUrl && auth.accessToken) {
    return { Authorization: `Bearer ${auth.accessToken}` };
  } else {
    return {};
  }
}


function handleResponse(response: Response): Promise<UserData> {
  return response.text().then((text: string) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const { user, logout } = useAuthStore();
      if ([401, 403].includes(response.status) && user) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        logout();
      }

      const error: string = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    // Ensure data is of type UserData
    return data as UserData;
  });
}
