import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { SessionService } from './session/session.service'
import { Reflector } from '@nestjs/core'
import { Request, Response } from 'express'
import Role from './roles'
import { AUTH_KEY } from './auth.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const minimumRole = this.getMinimumRole(context)
    if (!minimumRole) return true

    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    return this.sessionService.validateSession(request, response, minimumRole)
  }

  private getMinimumRole(context: ExecutionContext): Role {
    return this.reflector.getAllAndOverride<Role>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
  }
}
