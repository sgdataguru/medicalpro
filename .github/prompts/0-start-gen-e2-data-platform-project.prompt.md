---
description: We will start a new Gen-e2 project.
stage: Development
subcategory: subcategory-development-common
rule_name: start-gen-e2-data-platform-project
rule_version: latest
---

We will start a new Gen-e2 project.

Ask the following questions before proceeding:
## Questions to Ask
1. **Project Requirements and Features**:
   - What are the project requirements and features?
   - Are there any specific requirements for the project, like compliance, security, etc.?

2. **Infrastructure**:
   - Which cloud will we be using?
   - What is our target architecture?
   - Do you want to create the infrastructure files, and in which format (e.g., Terraform, CloudFormation)?

3. **Project Type**:
   - How is data coming into our platform? Streaming? Batch? Both?
   - What are the data sources, and how will we connect to them?
   - Are there any requirements for data governance?

## Actions Based on Answers
1. **Update Project Structure**:
Here is the base project structure:
```
.
├── README.md -- Describe the project and project goals
├── CONTRIBUTING.md
├── requirements.txt -- Python dependencies
├── docker-compose.yml -- Local development environment
├── scripts/ -- Contains scripts to manage the project
│   ├── manage.sh -- Manages servers and services (start,stop,status)
│   ├── setup.sh -- Installs project dependencies
├── docs/ -- Contains project documentation
│   ├── admin/ -- Documentation regarding permissions required and granted for different services
│   ├── architecture/ -- Architecture diagrams & docs
│   ├── features/ -- Contains documentation for project features (one file per feature)
│   ├── infra/ -- Contains an overview of the project
│   ├── project-context/ -- Contains an overview of the project
│   ├── index.md -- Main documentation file, indexing all other documentation
│   └── CONTRIBUTE.md -- Describes the project structure and best practices for contributions
├── data/ -- Contains all definitions of the data
│   ├── schemas/ -- Data schemas (JSON Schema, Avro, etc.)
│   ├── sample-data/ -- Sample datasets for testing
│   └── migrations/ -- Database migrations
├── src/ -- Contains all scripts pertaining to the operation of the data platform
│   ├── notebooks/ -- Contains data processing that is performed in notebooks
│   ├── pipelines/ -- Contains scripts for data pipelines
│   ├── serverless/ -- Contains data processing scripts for serverless execution (e.g. Lambda, Functions)
│   └── docs/ -- Contains data platform documentation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── infra/ -- Contains infrastructure code <refer to `terraform-cloud.instructions.md` for nested structure>
└── DevOps/
    ├── pipeline/
    └── docs/
```
   - Update the project structure based on the answers.
   - Update the README.md file, docs/index.md file, and `infra/docs/` folder documents with the information gathered.

2. **Create TODO.md**:
   - Create the `TODO.md` file and split it in a way that makes sense for this project.
   - Format:
     ```
     ## Domain
     [ ] Task to be done (owner)
     ```
   - Add tasks for each area of the project, like data-platform, infra, etc.
   - Ensure tasks are detailed and small enough to be done in a few hours.
   - Include tasks outside of development, like DevOps tasks, security tasks, etc.
   - Add lines regarding reviewing all generated files (like Architecture or API doc) and updating them as needed.

3. **Documentation**:
   - Suggest an infrastructure architecture diagram (in PLANTUML) and add it into `infra/docs` folder.
   - In the `docs/features/` folder, create a file for each feature that will be developed in this project.

4. **Tools and Dependencies**:
   - Suggest tools that could be useful for this project, like a specific database, a specific CI/CD tool, etc.
   - Create all necessary files for the project, like the .gitignore, the .gitattributes, etc.
   - Depending on the selected language, create the necessary files for it (like a package.json for a Node.js project or requirements.txt for python).
   - If a virtual environment is needed, suggest it and create it. Load all dependencies needed for the project.

5. **Infrastructure Files**:
   - Based on the user's preference, create the necessary infrastructure files (e.g., Terraform, CloudFormation) in the `infra/` directory.

6. **Version Control**:
   - Ensure to initialize a Git repository and create an initial commit.

7. **CI/CD Pipeline**:
   - Set up a CI/CD pipeline using a service like GitHub Actions, GitLab CI, or Jenkins.
   - Create the pipeline details in the `DevOps/pipeline` folder
   - Create a documentation of the application pipeline in the `DevOps/docs` folder.

8. **Testing**:
   - Set up testing frameworks and write initial test cases.

9. **Environment Configuration**:
   - Provide guidelines for handling environment variables and secrets (e.g., using .env files).

10. **Code Quality**:
   - Suggest tools for code quality checks, such as linters and formatters.

11. **Security**:
    - Include a section on security best practices and tools for vulnerability scanning.

12. **Deployment**:
    - Provide guidelines for deployment, including staging and production environments.

## Final Steps

1. **Project Name**:
   - Suggest a project name and ask if it's ok to create the project. If the user agrees, create the project with the name suggested.

2. **Review**:
   - Once all the other files are created, and you're clear on the requirements, review the gitignore files, as you might want to add more (like venv or node_modules).

3. **Check File Creation**:
   - Ensure that all the necessary files and folders have been created as per the project structure.

4. **Deploy Requirements**:
   - Run the necessary commands to deploy all the dependencies listed in the requirements files (e.g., `npm install` for Node.js, `pip install -r requirements.txt` for Python).
    - Set up the local development environment using the `docker-compose.yml` file.