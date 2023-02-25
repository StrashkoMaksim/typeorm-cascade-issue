import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, DataSource, OneToOne } from "typeorm";

@Entity()
class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => User, { cascade: ['update'] }) // Set cascade for update
  @JoinColumn()
  creator: User;
}

@Entity()
class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string | null;

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image | null;
}

const init = async () => {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "typeorm_issue",
    synchronize: true,
    logging: true,
    entities: [Image, User, Todo],
    subscribers: [],
    migrations: [],
  })
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  const todoRepo = AppDataSource.getRepository(Todo);

  await userRepo.save({ email: 'test@test.ru', password: 'pass' });

  const user = await userRepo.findOne({
    where: { email: 'test@test.ru' },
    // Join an entity that can be null. 
    // Without the presence of such an entity, the bug will not be reproduced
    relations: { image: true },
  });

  // We had a user come into the function with a cut password
  delete user.password;

  console.log(user);
  await todoRepo.save({ title: 'Todo 1', creator: user });

  // After the first todo save, the user object is mutated and password: null is added
  // When saving the second todo, the password in the database changes to null
  console.log(user);
  await todoRepo.save({ title: 'Todo 2', creator: user });
  console.log(user);
}

init();
