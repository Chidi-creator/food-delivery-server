import { AuthGuard } from '@nestjs/passport'

export class VendorJwtAuthGuard extends AuthGuard('vendor-jwt') {}
