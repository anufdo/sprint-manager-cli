import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import OpenAI from "openai";

// Initialize OpenRouter API
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "ccc",
});

// Function to gather requirements
async function gatherRequirements(): Promise<string> {
  const { requirement } = await inquirer.prompt([
    {
      type: 'input',
      name: 'requirement',
      message: 'Enter the project requirement:',
    },
  ]);
  return requirement;
}

// Function to generate tasks using OpenRouter
async function generateTasks(requirement: string) {
  console.log(chalk.blue('Generating tasks...'));
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an AI sprint planner. Break down requirements into small tasks, adding descriptions and code snippets where appropriate.',
      },
      { role: 'user', content: requirement },
    ],
  });

  const tasks = response.choices[0].message.content;
  return tasks || 'No tasks generated.';
}

// Function to export tasks to a file
async function exportTasksToFile(tasks: string) {
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Enter a file name for export (e.g., tasks.txt):',
      default: 'tasks.txt',
    },
  ]);

  fs.writeFileSync(fileName, tasks, 'utf-8');
  console.log(chalk.green(`Tasks exported successfully to ${fileName}`));
}

// Main function
async function main() {
  console.log(chalk.bold.cyan('Welcome to AI Sprint Manager CLI!'));
  const requirement = await gatherRequirements();
  const tasks = await generateTasks(requirement);

  console.log(chalk.yellow('\nGenerated Tasks:\n'));
  console.log(tasks);

  const { exportToFile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'exportToFile',
      message: 'Would you like to export tasks to a file?',
      default: true,
    },
  ]);

  if (exportToFile) {
    await exportTasksToFile(tasks);
  }
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error);
});
