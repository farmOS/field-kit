import { getHost } from '../remote';

export const authErrorMessage = (response = {}, message) => {
  const { status, data = {} } = response;
  if (status === 400 && data.error === 'invalid_grant') {
    return `${status} error: ${data.error_description}`;
  }
  if (status === 400 && data.error === 'invalid_client') {
    const oauthConfigUrl = `https://${getHost()}/admin/config/farm/oauth`;
    return `The OAuth client for farmOS Field Kit is not enabled on your farmOS server. Enable it <a href=${oauthConfigUrl}>here</a>.`;
  }
  if (status === 401) {
    const resetUrl = `https://${getHost()}/user/password`;
    return `The username or password you entered was incorrect. Please try again, or <a href="${resetUrl}">reset your password</a>.`;
  }
  if (status === 403) {
    return `${status} error: ${data.error_description}`;
  }
  return message || `${status} error: ${data.error_description || response.statusText}`;
};

export const authInterceptor = (error = {}, router) => {
  const { loginRequired, message, response = {} } = error;
  if (loginRequired) {
    if (router.currentRoute.path !== '/login') router.push('/login');
    return error;
  }
  if (response.status >= 400 && response.status <= 403) {
    if (router.currentRoute.path !== '/login') router.push('/login');
    return new Error(authErrorMessage(response, message), { cause: error });
  }
  return error;
};
