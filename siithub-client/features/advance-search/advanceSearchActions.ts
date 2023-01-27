import axios from "axios";

function getCount(type: string, param: string, repositoryId?: string) {
  return axios.get(`/api/search/${type}/count`, { params: { param, repositoryId } });
}

function getSearch<T>(type: string, param: string, repositoryId?: string, sort?: any) {
  return axios.get(`/api/search/${type}`, { params: { param, repositoryId, sort } });
}
export { getSearch, getCount };
