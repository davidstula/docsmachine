# My Docs as Code stack

I'm using these tools in the pipeline.

## Authoring

I write markdown files with **Notepad++**.

I use the following plugins:

- [AnotherMarkdown](https://github.com/ezyuzin/NppAnotherMarkdown)

## Versioning

I use Git on Windows locally. I host the repository on GitHub.

[Open the repository](https://github.com/davidstula/docsmachine)

To operate GitHub I use GitHub CLI in a PowerShell terminal. I'm authenticated via a Github token (the classic type) and communicating through HTTPS.

## Linter

Markdownlint checks the the markdown files for common formatting errors.

## AI review

OpenAI GPT 5.6 Luna checks new and updated documentation for clarity and documentation drift.

The AI review functionality is wrapped in a node.js script which uses the OpenAI Node.js SDK.

## Static site generator

I use [mkDocs](https://www.mkdocs.org/) to generate and serve a local version of the docs site.

## Automation

A GitHub Action workflow executes on a pull request to the "master" branch. The workflow runs on an Ubuntu runner and does the following:

1. Run the linter to check markdown formatting.
1. Build the static website with the ```--strict``` argument to check for build errors.
1. Run the AI review.
