// src/infrastructure/telemetry/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';


export async function startTelemetry() {
    const sdk = new NodeSDK({
        resource: resourceFromAttributes({
            'service.name': 'user-service',
        }),
        traceExporter: new OTLPTraceExporter({
            url: 'http://localhost:14318/v1/traces',
        }),
        instrumentations: [getNodeAutoInstrumentations()],
    })

    try {
        await sdk.start()
        console.log('✅ OpenTelemetry SDK started')
    } catch (err) {
        console.error('❌ OpenTelemetry SDK failed to start:', err)
    }
}
