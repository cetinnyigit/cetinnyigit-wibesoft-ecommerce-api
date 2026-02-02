import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'user-123', description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
