# Project Name

## Overview

This project is a web API built with Node.js and TypeScript. It provides various endpoints for managing bookmarks, conversations, and other resources. The API follows RESTful principles and includes features such as authentication, validation, and error handling.

## Features

- **Bookmarks Management**: Create, read, update, and delete bookmarks.
- **Conversations Management**: Manage conversations between users.
- **Authentication**: Secure endpoints with authentication.
- **Validation**: Validate request data to ensure data integrity.
- **Error Handling**: Consistent error handling across the API.

## Project Structure

- **src/constants**: Contains constant values used throughout the project.
- **src/controllers**: Contains the controllers that handle incoming requests and return responses.
- **src/middlewares**: Contains middleware functions for request processing.
- **src/models**: Contains the data models.
- **src/routes**: Contains route definitions.
- **src/services**: Contains business logic and service functions.
- **src/template-formats**: Contains templates for various formats.
- **src/utils**: Contains utility functions.
- **swagger**: Contains Swagger documentation files.
- **uploads**: Contains uploaded files such as images and videos.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd <project-directory>
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

### Running the Project

1. Start the development server:
   ```sh
   npm run dev
   ```
   or
   ```sh
   yarn dev
   ```

### Building the Project

1. Build the project:
   ```sh
   npm run build
   ```
   or
   ```sh
   yarn build
   ```

## API Documentation

The API documentation is available in the Swagger directory. You can view the API documentation by running the project and navigating to `/api-docs` in your browser.

## Postman Collection

You can find the Postman collection for testing the API [here](https://www.postman.com/warped-astronaut-443084/workspace/freeapi/collection/21153990-536dd415-2c48-4a62-81dc-4a75955e32e8?action=share&creator=21153990).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
