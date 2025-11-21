export const handleError = (error, setErrorMessage) => {
  if (!error?.response) {
    setErrorMessage("Network Error. Please check your connection.");
    return;
  }

  const { status, data } = error.response;

  if (status === 400 || status === 401) {
    setErrorMessage(data?.message || "Invalid Credentials");
  } else if (status === 404) {
    setErrorMessage("Resource not found!");
  } else if (status === 500) {
    setErrorMessage("Server Error. Try again later.");
  } else {
    setErrorMessage("Something went wrong.");
  }
};
