### Flow of Requests Handler + Error Handler

**When user requests a request have path /users/register**

```ts
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
```

**First, go to the register Validator middleware, It check the validation of body request**
In this course, we have 2 types of error : Error with UNPROCESSABLE_ENTITY(status 422, you can call it is validator error) and Other error.

##### 1.Error with UNPROCESSABLE_ENTITY(status 422)

**Here is the schema of Error with UNPROCESSABLE_ENTITY**

```ts
export type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USER_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
```

##### 2.Error with Other Errors

**Here is the schema of Error with Other Errors**

```ts
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}
```

##### 3.Error in validation area

When Throw new Error

### follower api -> POST, body : followed_user_id : string

### schema

\_id : object_id
user_id : object_id
followed_user_id : object_id
created_at : Date
