import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import config from "@/config";
import { ERROR_MESSAGES } from "@/libs/constants/messages";

// use this to interact with our own API (/app/api folder) from the front-end side
// See https://shipfa.st/docs/tutorials/api-call
const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      // User not auth, ask to re login
      toast.error(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED);
      // automatically redirect to /dashboard page after login
      return signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    } else if (error.response?.status === 403) {
      // User not authorized, must subscribe/purchase/pick a plan
      message = ERROR_MESSAGES.AUTH.PLAN_REQUIRED;
    } else {
      console.error("API error:", error?.response?.data?.error || error.message);
      message = ERROR_MESSAGES.GLOBAL.GENERIC;
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(error.message);

    // Automatically display errors to the user
    if (error.message) {
      toast.error(error.message);
    } else {
      toast.error(ERROR_MESSAGES.GLOBAL.GENERIC);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
