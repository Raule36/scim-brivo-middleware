import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('SCIM 2.0 Gateway for Brivo')
  .setDescription(
    'SCIM 2.0 compliant API for provisioning users and groups to Brivo Access Control System',
  )
  .setVersion('1.0')
  .addBasicAuth(
    {
      type: 'http',
      scheme: 'basic',
      description: 'Enter SCIM username and password',
    },
    'basic',
  )
  .build();

export const swaggerSetupOptions = {
  customSiteTitle: 'SCIM Gateway API',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
};
