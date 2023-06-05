import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { Animal } from "./animal.interface";

@Controller("/")
export class AppController {
    public constructor(private readonly appService: AppService) {
    }

    @Get("/:animalId")
    public async getAllAnimals(
        @Param("animalId") animalId: string
    ): Promise<Animal> {
        try {
            return this.appService.getAnimalById(animalId);
        } catch (e) {
            throw new BadRequestException();
        }
    }
}
