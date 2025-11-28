export function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  try {
    if (!token) {
      return true;
    }

    const decodedToken = parseJwt(token);
    
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }

    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (e) {
    return true;
  }
}

export function isTokenValid(token) {
  return token && !isTokenExpired(token);
}
