import Axios, { type AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create();

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	const promise = AXIOS_INSTANCE({ ...config, withCredentials: true }).then(
		({ data }) => data
	);

	return promise;
};

export default customInstance;
