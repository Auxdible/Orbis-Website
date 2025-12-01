// apps/api/src/main.ts
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ConfigService} from "@nestjs/config";
import {initializeEmail} from "@repo/auth";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
    });
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    const configService = app.get(ConfigService);

    const isDev = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: (origin, callback) => {
            if (isDev) {
                if (origin === 'http://localhost:3001') {
                    return callback(null, true);
                }
            } else {
                if (origin.endsWith('.orbis.place') || origin === 'https://orbis.place') {
                    return callback(null, true);
                }
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    const resendApiKey = configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY not found in .env');
    }

    initializeEmail(resendApiKey);

    const config = new DocumentBuilder()
        .setTitle('Orbis API')
        .setDescription('The Orbis API description')
        .setVersion('1.0')
        .addTag('Orbis')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();