import { app, HttpRequest, HttpResponseInit, InvocationContext, WarmupContext  } from "@azure/functions";
import { CommunicationIdentityClient } from "@azure/communication-identity";

let client: CommunicationIdentityClient;

export async function FirstFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const startTime = Date.now();

    if (!client) await warmupFunction({} as WarmupContext, context);

    const user = await client.createUser();

    const token = client.getToken(user, ["voip", "chat"]);

    const name = user.communicationUserId || " " || (await token).token || ' world';

    return { body: `${name}! 'it is took ' ${(Date.now() - startTime).toString()}`, status: 200};
};

export async function warmupFunction(warmupContext: WarmupContext, context: InvocationContext): Promise<void> {
    context.log('Function App instance is warm.');
    client = new CommunicationIdentityClient(process.env["connectionString"]);
}

app.warmup('warmup', {
    handler: warmupFunction,
});

app.http('FirstFunction', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: FirstFunction
});
