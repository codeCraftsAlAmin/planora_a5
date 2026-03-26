import { Role } from "../../generated/prisma/enums";

export interface IRequestUserInterface {
  userId: string;
  email: string;
  role: Role;
}
