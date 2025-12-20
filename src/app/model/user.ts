// import { Professor } from "./professor";
import { Role } from './role';

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  roles: Set<Role>;
  status?: number;
  email_verified?: boolean;
  phone?: string;
  dateOfBirth?: Date;
}
