export interface ISignUpEmail {
  name: string;
  email: string;
  password: string;
}

export interface ISignInEmail {
  email: string;
  password: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}

export interface IResetPassword {
  email: string;
  otp: string;
  newPassword: string;
}
