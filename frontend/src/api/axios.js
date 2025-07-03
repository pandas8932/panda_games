// src/api/axios.js

import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // using .env value here
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
