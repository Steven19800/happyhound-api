import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Pet } from './models/Pet';
import { Service } from './models/Service';
import { Booking } from './models/Booking';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true, // Be careful with this in production
  logging: true,
  entities: [User, Pet, Service, Booking],
  migrations: [],
  subscribers: [],
}); 