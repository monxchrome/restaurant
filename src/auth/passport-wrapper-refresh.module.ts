import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_REFRESH_SECRET,
        signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
      }),
    }),
  ],
  providers: [
    {
      provide: 'RefreshJwtService',
      useExisting: JwtModule,
    },
  ],
  exports: [JwtModule],
})
export class RefreshTokenModule {}
