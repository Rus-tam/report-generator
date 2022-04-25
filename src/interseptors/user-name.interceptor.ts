import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class UserNameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    let name: string = "";
    const ctx = context.switchToHttp();
    const rawHeaders: string[] = ctx.getRequest().rawHeaders;
    const nameIndex = rawHeaders.indexOf("Name");

    if (nameIndex >= 0) {
      name = rawHeaders[nameIndex + 1];
      request.user = name;
    }

    return next.handle().pipe();
  }
}
