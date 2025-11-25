import { message } from "antd";

export const handleError = (error) => {
  if (!error.response) {
    message.error("Network Error. Please check your connection.");
    return;
  }

  const { status, data } = error.response;

  if (status === 400 || status === 401) {
    const errorMsg = data?.message || "An error occurred.";
    message.error(errorMsg);
  } else if (status === 404) {
    const errorMsg = data?.message || "Requested resource not found.";
    message.error(errorMsg);
  } else if (status === 500) {
    message.error("Server Error. Please try again later.");
  } else {
    message.error("An unexpected error occurred.");
  }
};
