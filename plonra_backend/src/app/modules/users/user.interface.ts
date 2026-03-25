import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateMyProfileInterface {
  name?: string;
  phone?: string;
  image?: string;
  address?: string;
  bio?: string;
  gender?: Gender;
}
