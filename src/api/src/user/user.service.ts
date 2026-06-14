import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin(): Promise<void> {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@orderhub.com' },
    });

    if (existingAdmin) return;

    const passwordHash = await bcrypt.hash('Admin123*', 10);

    await this.userRepository.save({
      email: 'admin@orderhub.com',
      passwordHash,
      role: 'admin',
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}

