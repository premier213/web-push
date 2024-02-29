import axios from "axios";

export const pushInstance = axios.create({
  baseURL: "https://tjmkk.com/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer 219|pF1XeLx86dlua93Sb4vkKtze5skVsDvPlNU5TV6se09eff20`,
  },
});
