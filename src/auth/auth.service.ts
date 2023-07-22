import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInAuthDto } from './dto/signin-auth.dto';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { SignUpAuthDto } from './dto/signup-auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async signUpLocal(data: SignUpAuthDto) {
    const { password } = data;

    // create a hashed password
    const hashedPassword = await this.hashPassword(password);

    // add user to the database
    const user = await this.prisma.user
      .create({
        data: { ...data, password: hashedPassword },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new BadRequestException('User already exists');
          }
        }
        if (error instanceof PrismaClientValidationError) {
          throw new BadRequestException(
            'Missing field or incorrect field type',
          );
        }
        throw new BadRequestException('Unknown error occurred during sign up');
      });

    // retrieve jwt token
    const token = await this.jwt
      .signAsync({
        userId: user.id.toString(),
        email: user.email,
      })
      .catch(() => {
        throw new ForbiddenException('Unknown error occurred during sign up');
      });

    return { token, user };
  }

  async signInLocal(dto: SignInAuthDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        username: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordMatches = await bcrypt
      .compare(password, user.password)
      .then((value) => {
        // delete password
        delete user.password;

        return value;
      });

    if (!passwordMatches) {
      throw new BadRequestException('Invalid credentials');
    }

    // retrieve jwt token
    const token = await this.jwt
      .signAsync({
        userId: user.id.toString(),
        email: user.email,
      })
      .catch(() => {
        throw new ForbiddenException('Unknown error occurred during sign in');
      });

    return { token, user };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }
}
