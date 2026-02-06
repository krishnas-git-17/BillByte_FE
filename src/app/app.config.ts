import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { SqliteService } from './core/offline/sqlite.service';
import { initSqlite } from './core/offline/sqlite.init';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // 🔑 THIS IS THE FIX
    // SqliteService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initSqlite,
    //   deps: [SqliteService],
    //   multi: true
    // }
  ]
};
