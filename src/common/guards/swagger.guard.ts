import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guard pour protéger les routes Swagger en production
 *
 * Usage (si besoin de double protection):
 * @UseGuards(SwaggerGuard)
 *
 * Note: Swagger est déjà désactivé en production dans main.ts
 * Ce guard est une couche de sécurité supplémentaire optionnelle
 */
@Injectable()
export class SwaggerGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      throw new ForbiddenException('Swagger documentation is not available in production');
    }

    return true;
  }
}
