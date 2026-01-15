import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('rider-jwt') {}
