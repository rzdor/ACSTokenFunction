import { app, HttpRequest, HttpResponseInit, InvocationContext, WarmupContext  } from "@azure/functions";
import { CommunicationIdentityClient } from "@azure/communication-identity";

let client: CommunicationIdentityClient;

export async function AcsToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    if (!client) await warmupFunction({} as WarmupContext, context);
    const user = await client.createUser();
    const token = await client.getToken(user, ["voip", "chat"]);
    const response = {
        userId: user.communicationUserId,
        token: token.token,
        expiresOn: token.expiresOn
    };
    return { body: JSON.stringify(response), status: 200};
};

export async function warmupFunction(warmupContext: WarmupContext, context: InvocationContext): Promise<void> {
    client = new CommunicationIdentityClient(process.env["connectionString"]);
}

app.warmup('warmup', {
    handler: warmupFunction,
});

app.http('AcsToken', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: AcsToken
});
