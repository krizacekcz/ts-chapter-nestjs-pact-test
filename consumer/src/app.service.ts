import { HttpService, Injectable } from "@nestjs/common";
import { Animal } from "./animal.interface";

@Injectable()
export class AppService {
    private static readonly AUTH_HEADER = { authorization: "Bearer token" };

    private static getApiEndpoint() {
        return process.env.API_HOST || "http://localhost:8081";
    }

    public constructor(private readonly http: HttpService) {
    }

    public async getAnimalById(id: string | number): Promise<Animal> {
        const { data } = await this.http
            .get(`${ AppService.getApiEndpoint() }/animals/${ id }`, {
                headers: { ...AppService.AUTH_HEADER },
            })
            .toPromise();

        return data;
    }

}
