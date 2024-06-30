import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';

import { User } from './schemas';
import { CreateUserDto, LoginDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ message: string; token: string }> {
    try {
      const { email, password } = loginDto;

      const user = await this.findOneByEmail(email);

      if (!user) throw new NotFoundException('Invalid email.');

      const match = await bcrypt.compare(password, user.password);

      if (!match) throw new BadRequestException('Incorrect password.');

      const jwtToken = this.buildJwtToken(user);

      this.logger.log(`User with id ${user._id} logged in successfully`);

      return {
        message: 'User is login successfully',
        token: jwtToken,
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error?.stack);
      throw error;
    }
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; token: string }> {
    try {
      const existingUser = await this.findOneByEmail(createUserDto.email);

      if (existingUser)
        throw new BadRequestException('Account already exist with this email');

      const hashPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = await this.userModel.create({
        ...createUserDto,
        password: hashPassword,
      });

      const jwtToken = this.buildJwtToken(newUser);

      this.logger.log(`User with id ${newUser._id} registered successfully`);

      return {
        message: 'User is registered successfully',
        token: jwtToken,
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error?.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(
          'Invalid ID format. Id should be a valid mongodb ObjectId.',
        );
      }

      const user = await this.userModel.findById(id).exec();

      if (!user) throw new NotFoundException('User not found.');

      return user;
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`, error?.stack);
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${error.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  buildJwtToken(user: User) {
    try {
      return this.jwtService.sign({
        sub: user._id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      this.logger.error(
        `Error building jwt token: ${error.message}`,
        error?.stack,
      );
      throw error;
    }
  }
}
