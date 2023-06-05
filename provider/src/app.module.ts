import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppRepository } from "./app.repository";

@Module({
    controllers: [ AppController ],
    providers: [ AppRepository ],
    exports: [ AppRepository ],
})
export class AppModule {
}
