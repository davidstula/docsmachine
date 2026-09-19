# My Docs as Code stack

This page details the tools used in the pipeline and my reasoning for choosing those tools. For details about the pipeline itself, see [the home page](index.md).

## Authoring

I write markdown and the associated infrastructure code with **Notepad++**. It's the simplest tool that I already had on my computer. It is sufficient for this small prototype.

I use [AnotherMarkdown](https://github.com/ezyuzin/NppAnotherMarkdown) to preview the rendered markdown.

Future consideration: I will switch to VS Code for production projects as it provides a more integrated coding experience.

## Source control

Locally, I use **Git for Windows**. The [remote repository](https://github.com/davidstula/docsmachine) lives on **GitHub**.

I use **GitHub CLI** from a **PowerShell** terminal. I'm authenticated via a GitHub token (the classic type) and communicate through HTTPS.

GitHub is the most obvious choice for learning continuous integration practices and tools, as it's widely used and has detailed documentation.

## Creating outputs

I use **[mkDocs](https://www.mkdocs.org/)** to generate a static site.

Locally, I use the mkDocs _serve_ function to preview the end result. On GitHub, I use mkDocs to generate the site in a GitHub Actions workflow.

mkDocs uses its default settings.

I chose mkDocs randomly. I didn't want to spend time evaluating static side generators so I just picked the first one I found.

Future consideration: For simple pipelines such as this, I would use Jekyll, which is already integrated in GitHub.

## Publishing

I use **GitHub Pages** to publish the generated site.

A **GitHub Actions** workflow uses mkDocs to generate the output and publish it when changes to _docs/_ or _mkdocs.yml_ are pushed to _master_, including when a PR is merged. The workflow can also be run manually from the Actions tab.

## Content review

The documentation content goes through automated review. The following happens when a new pull request is created:

1. **MarkdownLint** validates the markdown code.
1. **mkDocs** checks that the site builds with the _--strict_ option.
1. OpenAI's **GPT-5.6 Luna** LLM reviews the content for clarity.

The AI review runs only if the markdown validation and build pass. It is skipped for PRs from forks.

I chose MarkdownLint as it's available as a published GitHub action, is widely used, and has high ratings.

I chose GPT-5.6 Luna as the model that does the review because it's cheap and provides decent quality of responses.

### Local AI review

The same Node.js module can be used locally with the ```--preview``` argument to generate an AI review of staged changes without having to commit the changes.

### AI review stack

A **Node.js** module orchestrates the AI review. It calls **OpenAI's JavaScript SDK** and uses GitHub CLI to post the review as a comment to the pull request.

These are tools I was somewhat familiar with so they represent the obvious choice for learning.
