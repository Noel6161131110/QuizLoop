import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const API_URL = import.meta.env.VITE_API_URL;

export { api , API_URL};