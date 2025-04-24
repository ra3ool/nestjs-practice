export interface IUser {
  userId: string;
  username: string;
  password?: string;
}

export interface IUserPayload {
  sub: string;
  username: string;
}
