import { chmodSync, readFileSync, writeFileSync } from "fs";
import { Node20GitHubActionTypescriptProject } from "dkershner6-projen-github-actions";
import { RunsUsing } from "projen-github-action-typescript";
import { Nvmrc } from "projen-nvm";

const MAJOR_VERSION = 2;
const NODE_VERSION = "24.14.0";
const MIN_NODE_VERSION = NODE_VERSION;

const project = new Node20GitHubActionTypescriptProject({
    majorVersion: MAJOR_VERSION,
    defaultReleaseBranch: "main",
    minNodeVersion: MIN_NODE_VERSION,
    workflowNodeVersion: NODE_VERSION,

    devDeps: [
        "@types/lodash.chunk",
        "dkershner6-projen-github-actions",
        "projen-github-action-typescript",
        "projen-nvm",
    ],
    name: "aws-ssm-getparameters-action",
    description:
        "A GitHub action centered on AWS Systems Manager Parameter Store GetParameters call, and placing the results into environment variables",

    actionMetadata: {
        name: "AWS SSM Parameter Store GetParameters Action",
        description:
            "AWS Systems Manager Parameter Store GetParameters call, including placing the results into environment variables",
        inputs: {
            parameterPairs: {
                required: true,
                description:
                    "The parameters you would like to retrieve, in pair format with an equal in between and comma delimited. The parameter name is the key, and the environment variable name is the value.",
            },
            withDecryption: {
                required: false,
                description:
                    "Whether to decrypt SecretString SSM parameters. Defaults to true.",
                default: "true",
            },
        },
        runs: {
            using: "node24" as RunsUsing,
            main: "dist/index.js",
        },
        branding: {
            icon: "lock",
            color: "blue",
        },
    },

    deps: ["@aws-sdk/client-ssm", "lodash.chunk"],

    autoApproveOptions: {
        allowedUsernames: ["dkershner6"],
    },

    sampleCode: false,
    docgen: true,
});

new Nvmrc(project, { nodeVersion: NODE_VERSION });

project.package.addField("engines", {
    node: `>= ${MIN_NODE_VERSION}`,
});

project.synth();

for (const workflowFile of [
    ".github/workflows/build.yml",
    ".github/workflows/release.yml",
    ".github/workflows/upgrade-main.yml",
]) {
    const workflow = readFileSync(workflowFile, "utf8")
        .replace(/pnpm\/action-setup@v2\.2\.4/g, "pnpm/action-setup@v6")
        .replace(/actions\/upload-artifact@v3/g, "actions/upload-artifact@v4")
        .replace(/actions\/download-artifact@v3/g, "actions/download-artifact@v4");

    chmodSync(workflowFile, 0o644);
    writeFileSync(workflowFile, workflow);
}

chmodSync(".npmrc", 0o644);
writeFileSync(
    ".npmrc",
    readFileSync(".npmrc", "utf8").replace(/^resolution-mode=highest\n?/m, ""),
);
