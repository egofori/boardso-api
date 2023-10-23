import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { firebaseAuth } from '@/utils/firebase';
import { SignInSocialAuthDto } from './dto/signin-social-auth.dto';
import { SignUpSocialAuthDto } from './dto/signup-social-auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async signUpLocal(data: SignUpAuthDto) {
    const { password } = data;

    // create a hashed password
    const hashedPassword = await this.hashPassword(password);

    // add user to the database
    await this.prisma.user
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
        confirmed: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // set user to confirmed if it's corresponding firebase user's
    // email is verified and the user is not confirmed
    if (!user.confirmed) {
      const firebaseUser = await firebaseAuth.getUserByEmail(email);

      if (firebaseUser.emailVerified) {
        this.prisma.user
          .update({
            where: {
              email,
            },
            data: {
              confirmed: true,
            },
          })
          .then(() => {
            delete user.confirmed;
          })
          .catch(() => {
            throw new BadRequestException('Unknown error occurred');
          });
      } else {
        throw new BadRequestException('Unverified user');
      }
    }

    const passwordMatches = await bcrypt
      .compare(password, user.password)
      .then((value) => {
        // delete password in user object
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

  async signUpSocial(data: SignUpSocialAuthDto) {
    const { email } = data;
    // add user to the database
    await this.prisma.user
      .create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          confirmed: true,
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

    try {
      // set user to confirmed if it's corresponding firebase user's
      // email is verified and the user is confirmed
      const firebaseUser = await firebaseAuth.getUserByEmail(email);

      if (firebaseUser.emailVerified) {
        const user = await this.prisma.user.update({
          where: {
            email,
          },
          data: {
            confirmed: true,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        // retrieve jwt token
        const token = await this.jwt
          .signAsync({
            userId: user.id.toString(),
            email: user.email,
          })
          .catch(() => {
            throw new ForbiddenException(
              'Unknown error occurred during sign in',
            );
          });

        return { token, user };
      }
    } catch (error) {}
  }

  async signInSocial(dto: SignInSocialAuthDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        confirmed: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // set user to confirmed if it's corresponding firebase user's
    // email is verified and the user is not confirmed
    if (!user.confirmed) {
      try {
        const firebaseUser = await firebaseAuth.getUserByEmail(email);

        if (firebaseUser.emailVerified) {
          await this.prisma.user
            .update({
              where: {
                email,
              },
              data: {
                confirmed: true,
              },
            })
            .catch(() => {
              throw new BadRequestException('Unknown error occurred');
            });
        } else {
          throw new BadRequestException('Unverified user');
        }
      } catch (error) {
        throw new BadRequestException('Unknown error occurred');
      }
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

    delete user.confirmed;

    return { token, user };
  }

  async resetPassword(firebaseUser: any, dto: ResetPasswordDto) {
    const { email } = firebaseUser;
    const { password } = dto;
    // create a hashed password
    const hashedPassword = await this.hashPassword(password);

    const updatedUser = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      throw new BadRequestException('Invalid user');
    }

    return 'Password updated';
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (!userId) {
      throw new UnauthorizedException('Unauthorized user');
    }

    const { oldPassword, password } = dto;

    // create a hashed password
    const hashedPassword = await this.hashPassword(password);

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password);

    let updatedUser: any;

    if (!passwordMatches) {
      throw new BadRequestException('Invalid credentials');
    } else {
      updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    if (!updatedUser) {
      throw new BadRequestException('Invalid user');
    }

    return 'Password updated';
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }
}
