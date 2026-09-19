import { execFileSync } from "node:child_process";
import { appendFile, readFile } from "node:fs/promises";
import OpenAI from "openai";

// PREVIEW MODE calls OpenAI for the staged diff but skips all GitHub side effects.
const previewMode = process.argv.includes("--preview");

const reviewPaths = [
  "docs",
  "README.md"
];

function collectDiff(baseSha, headSha) {
  return execFileSync(
    "git",
    ["diff", "--unified=40", baseSha, headSha, "--", ...reviewPaths],
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );
}

function collectPreviewDiff() {
  return execFileSync(
    "git",
    ["diff", "--cached", "--unified=40", "--", ...reviewPaths],
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );
}

function formatUsageSummary(response) {
  if (!response.usage) {
    throw new Error("The OpenAI response did not include token usage.");
  }

  const usage = response.usage;
  return [
    "### AI documentation review usage",
    "",
    "| Model | Input | Cached input | Output | Reasoning | Total |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    `| ${response.model} | ${usage.input_tokens} | ${usage.input_tokens_details.cached_tokens} | ` +
      `${usage.output_tokens} | ${usage.output_tokens_details.reasoning_tokens} | ${usage.total_tokens} |`,
    "",
  ].join("\n");
}

function postComment({ body, pullRequestNumber, repository }) {
  execFileSync(
    "gh",
    [
      "pr",
      "comment",
      String(pullRequestNumber),
      "--repo",
      repository,
      "--body-file",
      "-",
    ],
    {
      encoding: "utf8",
      input: body,
    },
  );
}

async function main() {
  const model = process.env.OPENAI_MODEL;
  let diff;
  let pullRequest;
  let repository;

  if (previewMode) {
    console.log(
      "PREVIEW MODE: reviewing staged changes; no GitHub comment will be posted.",
    );
    diff = collectPreviewDiff();
  } else {
    repository = process.env.GITHUB_REPOSITORY;
    const event = JSON.parse(
      await readFile(process.env.GITHUB_EVENT_PATH, "utf8"),
    );
    pullRequest = event.pull_request;
    diff = collectDiff(pullRequest.base.sha, pullRequest.head.sha);
  }

  if (!diff.trim()) {
    console.log(
      previewMode
        ? "There are no staged relevant changes to review."
        : "The pull request contains no relevant changes to review.",
    );
    return;
  }

  const instructions = await readFile(
    new URL("./instructions.md", import.meta.url),
    "utf8",
  );

  const openai = new OpenAI();
  const response = await openai.responses.create({
    model,
    instructions,
    input: `Review this pull request diff:\n\n${diff}`,
    max_output_tokens: 5000,
  });

  if (response.status !== "completed") {
    throw new Error(`The OpenAI response did not complete: ${response.status}.`);
  }

  const review = response.output_text.trim();
  if (!review) {
    throw new Error("The OpenAI response contained no review text.");
  }

  const comment = [
    "## AI documentation review",
    "",
    review
  ].join("\n");

  const usageSummary = formatUsageSummary(response);

  if (previewMode) {
    console.log("\n--- PR COMMENT PREVIEW ---\n");
    console.log(comment);
    console.log("\n--- TOKEN USAGE ---\n");
    console.log(usageSummary);
    return;
  }

  await appendFile(process.env.GITHUB_STEP_SUMMARY, usageSummary, "utf8");

  postComment({
    body: comment,
    pullRequestNumber: pullRequest.number,
    repository,
  });
}

main().catch((error) => {
  console.error(`AI review failed: ${error.message}`);
  process.exitCode = 1;
});
