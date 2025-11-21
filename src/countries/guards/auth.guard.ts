import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly SECRET_TOKEN = 'mi-token-secreto';

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-api-token'];

    if (!token || token !== this.SECRET_TOKEN) {
      throw new UnauthorizedException('Token de acceso inválido o no proporcionado');
    }

    return true;
  }
}
