import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// create token
const createToken = (
  payload: JwtPayload,
  secret: string,
  { expiresIn }: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

// verify token
const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);

    return {
      ok: true,
      data: decoded,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error.message,
      error: error,
    };
  }
};

// decoded token
const decodedToken = (token: string) => {
  const decoded = jwt.decode(token);
  return decoded;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  decodedToken,
};
