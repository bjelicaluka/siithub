import axios from "axios";

function addStarFor(username: string, repo: string) {
  return () => axios.post(`/api/${username}/${repo}/star`);
}
function removeStarFor(username: string, repo: string) {
  return () => axios.delete(`/api/${username}/${repo}/star`);
}
function getStar(username: string, repo: string) {
  return axios.get(`/api/${username}/${repo}/star`);
}
function getStargazers(username: string, repo: string) {
  return axios.get(`/api/${username}/${repo}/stargazers`);
}

export { addStarFor, removeStarFor, getStar, getStargazers };
