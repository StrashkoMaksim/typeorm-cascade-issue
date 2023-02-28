### Issue description

On one of our projects, some users simply erased the password in the database. We caught the bug for a very long time and realized that this happens in one of the functions when several entities (Todo) associated with the user are added at once. A user without a password came to the function (it was cut out in nestjs guard). If only one entity was added, then the password did not disappear. It turned out that if the user object has some kind of nullable foreign key with another entity (Image), and we specify it in relations on find, then the first time the Todo is saved, the user object starts to mutate, but does not save these changes in DB.

### Expected Behavior

If the password is not specified explicitly null, then it either does not need to be mutated at all, or it needs to be mutated and immediately stored in the database. And there is no need to wait for other related null entities. Most likely the first option will be more preferable.

### Actual Behavior

On the first save, the object mutates, and on the second, it saves it to the database.

### My Environment

| Dependency          | Version  |
| ---                 | ---      |
| Operating System    | Windows |
| Node.js version     | 18.14.2  |
| Typescript version  | 4.3.5  |
| TypeORM version     | 0.3.12  |

### Relevant Database Driver(s)

- [X] postgres
