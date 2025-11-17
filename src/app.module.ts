import { Module } from '@nestjs/common';
import { CoreModule } from '@core';

@Module({
  imports: [
    CoreModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
