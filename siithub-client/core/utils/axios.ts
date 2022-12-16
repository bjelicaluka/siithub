import { AxiosInstance } from 'axios';
import { getToken } from './token';

const interceptors: { [key: string]: any } = {};

export function setAxiosInterceptors(axiosInstance: AxiosInstance, onLogout: () => any = () => {}) {
  setAuthorizationHeaderInterceptor(axiosInstance);
  setUnauthorizedRequestInterceptor(axiosInstance, onLogout);
}

export function setAuthorizationHeaderInterceptor(axiosInstance: AxiosInstance) {
  const interceptorName = 'authHeader';

  if(interceptors[interceptorName]) {
    axiosInstance.interceptors.request.eject(interceptors[interceptorName]);
  }

  interceptors[interceptorName] = axiosInstance.interceptors.request.use((config: any) => {
    const token = getToken() || '';

		if (token) {
      config.headers.Authorization = 'Bearer ' + token;
		}
		
    return config;
  });
}

export function setUnauthorizedRequestInterceptor(axiosInstance: AxiosInstance, onLogout: () => any = () => {}) {
  const interceptorName = 'unauthRequest';

  if(interceptors[interceptorName]) {
    axiosInstance.interceptors.response.eject(interceptors[interceptorName]);
  }

  interceptors[interceptorName] = axiosInstance.interceptors.response.use(function (response) {
		return response;
	}, function (error) {
		if ([401, 403].includes(error.response.status) && getToken()) {
			onLogout();
			console.log("Should logout here");
		} else {
			return Promise.reject(error);
		}
	});
}