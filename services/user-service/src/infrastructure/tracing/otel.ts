// service/user-service/src/infrastructure/tracing/otel.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FastifyOtelInstrumentation } from '@fastify/otel';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

let otel: FastifyOtelInstrumentation;

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG) 
export async function setupOpenTelemetry() {
    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:14318/v1/traces',
        }),
        // ไม่ต้องใส่ `resource`
    });

    await sdk.start();
    console.log('✅ OpenTelemetry SDK started')

    otel = new FastifyOtelInstrumentation({
        servername: process.env.OTEL_SERVICE_NAME || 'user-service',
    } as any);
}

export function getOtelPlugin() {
    return otel;
}
