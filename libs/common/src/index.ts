export * from './schemas/types/user';
export * from './schemas/abstract.schema';
export * from './schemas/abstract.repository';
export * from './global/common';
export * from './schemas/user.schema';
export * from './dto/user-dto';
export * from './filters/gateway-exception.filter';
export * from './filters/microservice-exception.filter';
export * from './interceptors/logging.interceptor';
export * from './typings/notification';
export * from './utils/phoneNumber';
export * from './typings/services';

// Export with aliases to avoid naming conflicts
export { 
  ValidationException as RpcValidationException,
  CustomRpcException,
  UserNotFoundException,
  DatabaseException
} from './exceptions/rpc.exceptions';

export { 
  ValidationException as GatewayValidationException,
  GatewayException,
  AuthenticationException,
  AuthorizationException,
  ServiceUnavailableException,
  RateLimitException,
  MicroserviceTimeoutException
} from './exceptions/gateway.exceptions';

