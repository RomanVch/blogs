import { UsersDbRepository } from "./repository/users-db-repository";
import {UsersService} from "./domain/users-service";

const usersDbRepository = new UsersDbRepository()
export const usersService = new UsersService(usersDbRepository)