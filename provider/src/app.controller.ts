import { Controller, Get, NotFoundException, Param, UseInterceptors, } from "@nestjs/common";
import { Animal } from "./animal.interface";
import { AppRepository } from "./app.repository";
import { AppInterceptor } from "./app.guard";

@Controller("/animals")
@UseInterceptors(new AppInterceptor())
export class AppController {
    public constructor(
        private readonly repository: AppRepository
    ) {
    }

    @Get("/:id")
    public getAnimalById(@Param("id") id: string): Animal {
        const result = this.repository.getById(parseInt(id, 10));

        if (!result) {
            throw new NotFoundException("Animal not found");
        }

        return result;
    }
}
