import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
	files: "out/tests/integration/**/*.test.js",
	workspaceFolder: "./test-workspace",
	mocha: {
		timeout: 20000,
	},
	launchArgs: [
		"--disable-updates",
		"--skip-release-notes",
		"--user-data-dir", ".vscode-test/user-data",
	],
});
