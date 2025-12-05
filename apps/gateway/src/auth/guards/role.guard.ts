import { User, UserRole } from '@chidi-food-delivery/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../module.api/decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user as User;

    return matchRoles(requiredRoles, user.role);
  }
}

const matchRoles = (
  requiredRoles: UserRole[],
  userRoles: UserRole[],
): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role));
};
