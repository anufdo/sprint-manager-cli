# AI Sprint Manager CLI

This is a **Command-Line Interface (CLI) tool** designed to manage software development sprints with the help of AI models. It takes high-level project requirements, refines them into user stories, generates detailed tasks, and optionally exports these tasks into a structured `.txt` file. This tool uses the **OpenRouter API** to integrate multiple AI models for different phases of the task creation process.

---

## Features

- **Requirement Refinement:** Break down high-level requirements into user stories.
- **Task Generation:** Create small, actionable tasks with detailed descriptions and optional code snippets.
- **Validation:** Validate and refine the generated tasks.
- **Export:** Export the tasks into a `.txt` file.
- **Multi-Model Integration:** Use different AI models for various stages (e.g., refinement, task generation, validation).

---

## Prerequisites

### 1. Node.js

Make sure you have **Node.js v23+** installed.

Check your Node.js version:

```bash
node -v
```

If not installed, [download Node.js here](https://nodejs.org/).

### 2. API Key

You need an **OpenRouter API key** to use this tool.

- Sign up and generate your API key at [OpenRouter](https://openrouter.ai/).
- Models available on OpenRouter include **GPT-4**, **Claude**, and more. View the model list [here](https://openrouter.ai/models).

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/sprint-manager-cli.git
   cd sprint-manager-cli
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root:

     ```
     OPENROUTER_API_KEY=your-api-key
     MODEL=openai/gpt-3.5-turbo
     ```

4. Run the CLI tool:

   ```bash
   node index.ts
   ```

---

## Usage

### Interactive Workflow

1. Run the tool:

   ```bash
   node index.ts
   ```

2. Follow the prompts to:
   - Enter the high-level project requirement.
   - View the refined user stories.
   - Generate detailed tasks with descriptions and code snippets.
   - Export the tasks to a `.txt` file.

### Example

#### Input

```plaintext
Build a task management system with user authentication and Kanban board.
```

#### Output (`tasks.txt`)

```plaintext
1. Create the database schema for user accounts.
   Description: Define tables for users with fields for email, password, and roles.

2. Build the registration API.
   Description: Create an endpoint for user registration with email validation.
   Code Snippet:
   app.post('/register', async (req, res) => {
       // Logic here
   });

3. Implement login and logout functionality.
   Description: Create endpoints for secure user authentication.

4. Build a Kanban board UI for task management.
   Description: Display tasks in columns (To Do, In Progress, Done) with drag-and-drop functionality.
```

---

## Project Structure

```
.
├── index.ts            # Main CLI logic
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (API key)
├── node_modules/       # Installed packages
└── tasks.txt           # Example exported tasks
```

---

## Dependencies

- **[@openrouter/client](https://www.npmjs.com/package/@openrouter/client):** Interact with OpenRouter API.
- **inquirer:** CLI prompts and interactions.
- **chalk:** Add colors to terminal output.
- **dotenv:** Load environment variables.

---

## API Integration

This tool uses the [OpenRouter API](https://openrouter.ai/) to:

1. Refine requirements into user stories (using models like GPT-4).
2. Generate tasks and code snippets (using models like Claude).
3. Validate tasks for clarity and completeness.

---

## Limitations

- Requires an active OpenRouter API key.
- Generated tasks depend on the quality of the input and model capabilities.

---

## Future Enhancements

- Add support for exporting tasks in JSON/CSV formats.
- Introduce a flag system for automation (e.g., `--requirement`, `--output`).
- Enhance task prioritization and sprint planning.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Support

If you encounter issues or have questions, feel free to create an issue on the GitHub repository.
