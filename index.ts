import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import inquirer from 'inquirer';
import OpenAI from "openai";

dotenv.config();

// Initialize OpenRouter API
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced system prompt
const SPRINT_PLANNER_PROMPT = `
You are an expert Agile sprint planning assistant with 15 years of experience managing technical teams. 
Your task is to break down product requirements into well-structured sprint tasks following these guidelines:

1. Create user stories with INVEST criteria
2. Define clear acceptance criteria for each task
3. Estimate story points using Fibonacci sequence (1, 2, 3, 5, 8)
4. Identify technical dependencies between tasks
5. Suggest potential edge cases to consider
6. Recommend relevant tech stack components when appropriate
7. Include code snippets for complex technical implementations
8. Flag potential risks with mitigation strategies
9. Prioritize tasks using MoSCoW method (Must-have, Should-have, Could-have, Won't-have)

Format output in Markdown with the following structure:
# Sprint Plan [MM/YYYY]
## User Stories
### [Story Title] (SP: [X])
**Priority:** [MoSCoW label]  
**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2

**Technical Notes:**  
\`\`\`[relevant language]
// Sample implementation
\`\`\`

**Dependencies:** [List any dependent tasks]  
**Risks:** [Potential challenges]  
`;

// Validate API key
function checkEnv() {
  if (!process.env.OPENAI_API_KEY) {
    console.log(chalk.red('Error:') + ' Please set OPENAI_API_KEY in .env file');
    process.exit(1);
  }
}

// Enhanced requirement gathering
async function gatherRequirements() {
  const responses = await inquirer.prompt([
    {
      type: 'input',
      name: 'objective',
      message: 'Project objective:',
      validate: input => input.length > 10 || 'Please enter at least 10 characters',
    },
    {
      type: 'list',
      name: 'sprintDuration',
      message: 'Sprint duration:',
      choices: ['1 week', '2 weeks', '3 weeks', '4 weeks'],
      default: '2 weeks'
    },
    {
      type: 'checkbox',
      name: 'techStack',
      message: 'Select technologies:',
      choices: ['Node.js', 'Python', 'React', 'TypeScript', 'AWS', 'Docker', 'Other']
    }
  ]);

  const prompt = `Create sprint plan for: ${responses.objective}
Sprint Duration: ${responses.sprintDuration}
Tech Stack: ${responses.techStack.join(', ')}`;

  return prompt;
}

// Enhanced task generation
async function generateSprintPlan(requirement: string) {
  console.log(chalk.blue('\n🚀 Generating sprint plan...'));
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL || 'anthropic/claude-3-opus',
      messages: [
        { role: 'system', content: SPRINT_PLANNER_PROMPT },
        { role: 'user', content: requirement },
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content || 'No plan generated.';
  } catch (error) {
    console.error(chalk.red('API Error:'), error);
    process.exit(1);
  }
}

// Enhanced export function
async function exportPlan(content: string) {
  const { fileName } = await inquirer.prompt({
    type: 'input',
    name: 'fileName',
    message: 'Export filename (e.g., sprint-plan.md):',
    default: 'sprint-plan.md',
    validate: name => {
      const isValid = /^[\w\-. ]+$/.test(name);
      return isValid || 'Invalid filename! Use only letters, numbers, and dashes';
    }
  });

  if (fs.existsSync(fileName)) {
    const { overwrite } = await inquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: `File ${fileName} exists. Overwrite?`,
      default: false
    });
    
    if (!overwrite) {
      console.log(chalk.yellow('Export canceled'));
      return;
    }
  }

  fs.writeFileSync(fileName, content);
  console.log(chalk.green(`\n✅ Sprint plan saved to ${chalk.bold(fileName)}`));
}

// Interactive review loop
async function reviewCycle(content: string) {
  let modifiedContent = content;
  
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Sprint plan options:',
      choices: [
        'View plan',
        'Edit plan',
        'Export plan',
        'Generate alternative',
        'Exit'
      ]
    });

    switch (action) {
      case 'View plan':
        console.log(chalk.cyan('\n' + modifiedContent));
        break;
      case 'Edit plan':
        const { edits } = await inquirer.prompt({
          type: 'editor',
          name: 'edits',
          message: 'Edit plan in your default editor:',
          default: modifiedContent
        });
        modifiedContent = edits;
        break;
      case 'Export plan':
        await exportPlan(modifiedContent);
        break;
      case 'Generate alternative':
        modifiedContent = await generateSprintPlan(modifiedContent);
        break;
      case 'Exit':
        return;
    }
  }
}

// Main function
async function main() {
  checkEnv();
  console.log(chalk.bold.cyan('\n✨ AI Sprint Manager CLI ✨'));
  
  const requirement = await gatherRequirements();
  const plan = await generateSprintPlan(requirement);
  
  console.log(chalk.yellow('\n📋 Generated Sprint Plan:\n'));
  console.log(plan);
  
  await reviewCycle(plan);
}

main().catch(error => {
  console.error(chalk.red('Unexpected Error:'), error);
  process.exit(1);
});