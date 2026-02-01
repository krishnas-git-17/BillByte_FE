import { SqliteService } from './sqlite.service';

export function initSqlite(sqlite: SqliteService) {
  return () => sqlite.init();
}
