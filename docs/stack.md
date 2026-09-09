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

## Static site generator

I use [mkDocs](https://www.mkdocs.org/) to generate and serve a local version of the docs site.

## Automation

A GitHub Action workflow executes on a pull request to the "master" branch. The workflow runs on an Ubuntu runner with Python and does the following: 

1. Install mkDocs.
1. Check out the master branch.
1. Run ```mkdocs build```.
1. Upload the resulting ```site``` folder to Github Pages as an artifact.
1. Deploy the pages.