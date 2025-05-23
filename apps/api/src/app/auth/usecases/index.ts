import { SwitchEnvironment } from './switch-environment/switch-environment.usecase';
import { SwitchOrganization } from './switch-organization/switch-organization.usecase';
import { PasswordResetRequest } from './password-reset-request/password-reset-request.usecase';
import { UserRegister } from './register/user-register.usecase';
import { Login } from './login/login.usecase';
import { PasswordReset } from './password-reset/password-reset.usecase';
import { UpdatePassword } from './update-password/update-password.usecase';
import { CreateOrganization } from '../../organization/usecases/create-organization/create-organization.usecase';
import { AddMember } from '../../organization/usecases/membership/add-member/add-member.usecase';
import { GetOrganization } from '../../organization/usecases/get-organization/get-organization.usecase';

export const USE_CASES = [
  UserRegister,
  Login,
  SwitchEnvironment,
  SwitchOrganization,
  PasswordResetRequest,
  PasswordReset,
  UpdatePassword,
  CreateOrganization,
  AddMember,
  GetOrganization,
];
