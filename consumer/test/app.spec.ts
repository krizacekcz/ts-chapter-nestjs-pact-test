import { PactFactory } from "nestjs-pact";
import { Test } from "@nestjs/testing";
import { HttpStatus } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PactModule } from "./pact/pact.module";
import { Matchers, Pact } from "@pact-foundation/pact";
import { AppService } from "../src/app.service";
import { HTTPMethods } from "@pact-foundation/pact/src/common/request";

jest.setTimeout(30000);

describe('Pact', () => {
    let pactFactory: PactFactory;
    let provider: Pact;
    let animalsService: AppService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ AppModule, PactModule ],
        }).compile();

        pactFactory = moduleRef.get(PactFactory);

        provider = pactFactory.createContractBetween({
            consumer: 'NestJS consumer 4',
            provider: 'NestJS provider 4',
        });

        animalsService = moduleRef.get(AppService);

        const { port } = await provider.setup();
        process.env.API_HOST = `http://localhost:${ port }`;
    });

    afterEach(() => provider.verify());

    afterAll(() => provider.finalize());

    const { eachLike, like, term, iso8601DateTimeWithMillis } = Matchers;

    const animalBodyExpectation = {
        id: like(1),
        available_from: iso8601DateTimeWithMillis(),
        first_name: like('Billy'),
        last_name: like('Goat'),
        animal: like('goat'),
        age: like(21),
        gender: term({
            matcher: 'F|M',
            generate: 'M',
        }),
        location: {
            description: like('Melbourne Zoo'),
            country: like('Australia'),
            post_code: like(3000),
        },
        eligibility: {
            available: like(true),
            previously_married: like(false),
        },
        interests: eachLike('walks in the garden/meadow'),
    };

    describe('when a call to the Animal Service is made to retreive a single animal by ID', () => {
        describe('and there is an animal in the DB with ID 1', () => {
            beforeAll(() =>
                provider.addInteraction({
                    state: 'Has an animal with ID 1',
                    uponReceiving: 'a request for an animal with ID 1',
                    withRequest: {
                        method: HTTPMethods.GET,
                        path: term({ generate: '/animals/1', matcher: '/animals/[0-9]+' }),
                        headers: { Authorization: 'Bearer token' },
                    },
                    willRespondWith: {
                        status: HttpStatus.OK,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                        },
                        body: animalBodyExpectation,
                    },
                }),
            );

            it('returns the animal', async () => {
                const suggestedMates = await animalsService.getAnimalById(11);

                expect(suggestedMates).toHaveProperty('id', 1);

            });
        });

        describe('and there no animals in the database', () => {
            beforeAll(() =>
                provider.addInteraction({
                    state: 'Has no animals',
                    uponReceiving: 'a request for an animal with ID 100',
                    withRequest: {
                        method: HTTPMethods.GET,
                        path: '/animals/100',
                        headers: { Authorization: 'Bearer token' },
                    },
                    willRespondWith: {
                        status: HttpStatus.NOT_FOUND,
                    },
                }),
            );

            it('returns a 404', async () => {
                const suggestedMates = animalsService.getAnimalById(100);

                await expect(suggestedMates).rejects.toThrowError();
            });
        });
    });
});