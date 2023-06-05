import { PactProviderOptions, PactProviderOptionsFactory } from "nestjs-pact";
import { versionFromGitTag } from "absolute-version";
import { execSync } from "child_process";

export class PactProviderConfigOptionsService
    implements PactProviderOptionsFactory {
    public createPactProviderOptions(): PactProviderOptions {
        const verificationByProviderOpts = {
            consumerVersionSelectors: [
                {
                    matchingBranch: true
                }
            ],
            enablePending: true
        };

        return {
            provider: "NestJS provider 4",
            logLevel: "info",

            requestFilter: (req, res, next) => {
                req.headers.authorization = `Bearer 1234`;
                next();
            },
            ...(process.env.PACT_URL ? { pactUrls: [ process.env.PACT_URL ] } : {}),
            ...(!process.env.PACT_URL
                ? {
                    pactBrokerUrl: "https://test.pactflow.io/",
                    consumerVersionSelectors:
                    verificationByProviderOpts.consumerVersionSelectors,
                    enablePending: verificationByProviderOpts.enablePending
                }
                : {}),
            pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
            pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
            publishVerificationResult: true,
            providerVersion: versionFromGitTag(),
            providerVersionBranch: execSync("git rev-parse --abbrev-ref HEAD")
                .toString()
                .trim()
        };
    }
}
