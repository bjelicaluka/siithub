import axios from "axios";
import { useQuery } from "react-query";

export function useTest() {
  const { data } = useQuery("lalapo", () => axios.get("/api/test/1"));

  return {
    data: data?.data,
  };
}
