import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Session } from "../utils/types";

export interface CustomRequest extends Request {
  user: Session; // Adjust the type as needed
}

const verifyTokenMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // Verify the token using your secret key
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET); // Adjust the type

      // Attach the decoded token data to the request object
      req.user = decoded;
      next();
    } catch (error) {
      // Token verification failed
      return res.status(401).json({ message: "Not Authorized" });
    }
  } else {
    // No token provided
    return res.status(401).json({ message: "Not Authorized" });
  }
};

export default verifyTokenMiddleware;
