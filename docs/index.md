# Dave's Documentation Publishing Machine

This project allows me to learn continuous integration and continuous deployment practices for documentation.

I **love** docs as code! I'm really enjoying the multidisciplinary nature of setting up and operating the pipeline:

* writing markdown
* operating stuff from the terminal
* working with git
* setting up stuff in GitHub
* writing workflows in YAML
* vibe coding node modules
* developing AI prompts
* operating APIs

I feel like a real hacker! :)

## The Pipeline

Here's how the whole thing works.

### First-time setup

Prerequisites: a local clone of the repository, Git, Python with pip, and Node.js 22 or newer.

Run all commands from the repository root. The commands below use PowerShell.

1. Install mkDocs: ```pip install mkdocs```
1. Install the AI review dependency: ```npm ci --prefix .github/ai-review```
1. Create an _.env_ file in the repository root with your own API key and model:

   ```dotenv
   OPENAI_API_KEY=your-api-key
   OPENAI_MODEL=your-model-id
   ```

### Contributing

Follow these steps when you want to contribute to the docs.

1. Pull _master_.
1. Create a new local branch.
1. Write.
1. Stage the changes (don't commit).
1. Run the AI preview: ```node --env-file=.env .\.github\ai-review\review.mjs --preview```
1. Run ```mkdocs serve``` to check how your work looks on the generated site. Open <http://127.0.0.1:8000/> in your browser.
1. Commit.
1. Create a PR for merging your branch to _master_.

### Automatic PR checks

A GitHub Actions workflow runs when a PR is created or when you push the PR branch. The workflow is defined in _.github\workflows\pr-checks.yml_.

The AI review is skipped for PRs from forks.

This happens automatically:

1. Run MarkdownLint to validate the markdown. Only the _docs_ folder is validated. The workflow stops if it finds errors.
1. Run ```mkdocs build --strict``` to check that the site builds. If the build fails, the workflow stops.
1. Generate a diff of your changes against master.
1. Run the AI review (_.github\ai-review\review.mjs_) on the diff.
1. Post the AI review as a PR comment. Token consumption information appears in the GitHub Actions job summary. The AI review is advisory, findings do not block merging the PR.

After I review the PR, I merge it manually.

### Publishing

A GitHub Actions workflow builds and publishes the site in GitHub Pages when changes to _docs/_ or _mkdocs.yml_ are pushed to _master_, including when a PR is merged. You can also run it manually from the Actions tab. The workflow is defined in _.github\workflows\builddocs.yml_.
