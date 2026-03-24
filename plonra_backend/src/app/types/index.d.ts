import { IRequestUserInterface } from "../middleware/requestUserInterface";

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUserInterface;
    }
  }
}
