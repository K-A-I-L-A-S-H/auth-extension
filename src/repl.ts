import { repl } from "@nestjs/core";
import { AppModule } from "./app";

async function bootstrap() {
  await repl(AppModule);
}

// pnpm run start -- --entryFile repl
bootstrap();
