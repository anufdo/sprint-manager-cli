import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import inquirer from 'inquirer';
import OpenAI from 'openai';

dotenv.config();

// Initialize OpenRouter API
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced system prompt with role-specific instructions and bite-sized tasks
const SPRINT_PLANNER_PROMPT = `
You are an expert Agile sprint planning assistant with 15 years of experience managing technical teams across various domains including Software Architecture, UI/UX Design, DevOps, Frontend, and Backend development. Your task is to break down product requirements into detailed, actionable sprint tasks that can be completed within a couple of hours. Each task must be assigned to a specific role (e.g., Software Architect, Designer, DevOps Engineer, Frontend Developer, Backend Developer, QA Engineer, Product Manager, etc.). Follow these guidelines:

1. **User Stories & INVEST Criteria:** Create user stories that are Independent, Negotiable, Valuable, Estimable, Small, and Testable.
2. **Acceptance Criteria:** Define clear acceptance criteria for each task.
3. **Estimation:** Estimate story points using the Fibonacci sequence (1, 2, 3, 5, 8).
4. **Technical Dependencies:** Identify dependencies between tasks.
5. **Edge Cases:** Suggest potential edge cases to consider.
6. **Tech Stack Recommendations:** Recommend relevant tech stack components when appropriate.
7. **Code Snippets:** Include code snippets for complex technical implementations when needed.
8. **Risks & Mitigations:** Flag potential risks and provide mitigation strategies.
9. **Task Breakdown:** Break down tasks into smaller subtasks that can each be completed in under 2-3 hours.
10. **Role Assignment:** Clearly assign each task and subtask to a specific role (e.g., Software Architect, Designer, DevOps Engineer, etc.).
11. **Prioritization:** Prioritize tasks using the MoSCoW method (Must-have, Should-have, Could-have, Won't-have).

Format the output in Markdown with the following structure:

# Sprint Plan [MM/YYYY]
## User Stories
### [Story Title] (SP: [X])
**Assigned Role:** [Role]  
**Priority:** [MoSCoW label]  

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2

**Technical Notes:**  
\`\`\`[language]
// Sample implementation (if applicable)
\`\`\`

**Subtasks (each should be achievable in a couple of hours):**
- **Task:** [Task description] *(Assigned Role: [Role])*
- **Task:** [Task description] *(Assigned Role: [Role])*

**Dependencies:** [List any dependent tasks]  
**Risks:** [Potential challenges and mitigation strategies]

Ensure that all tasks are specific, measurable, and small enough to be completed within a couple of hours.
`;

// Validate API key
function checkEnv() {
  if (!process.env.OPENAI_API_KEY) {
    console.log(chalk.red('Error:') + ' Please set OPENAI_API_KEY in the .env file');
    process.exit(1);
  }
}

// Enhanced requirement gathering with role selection
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
    },
    {
      type: 'checkbox',
      name: 'roles',
      message: 'Select roles involved in this sprint:',
      choices: ['Software Architect', 'Designer', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'QA Engineer', 'Product Manager']
    }
  ]);

  const prompt = `Create a detailed sprint plan for: ${responses.objective}
Sprint Duration: ${responses.sprintDuration}
Tech Stack: ${responses.techStack.join(', ')}
Roles Involved: ${responses.roles.join(', ')}`;

  return prompt;
}

// Enhanced task generation acting as an agent for detailed breakdown
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
      return isValid || 'Invalid filename! Use only letters, numbers, dashes, underscores, and dots';
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
