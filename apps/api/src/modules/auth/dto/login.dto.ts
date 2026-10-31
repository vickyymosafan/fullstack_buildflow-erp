import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'director@buildflow.id', description: 'User corporate email' })
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'Account password' })
  password!: string;
}

