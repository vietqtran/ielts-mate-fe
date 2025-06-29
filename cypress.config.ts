import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
      on("task", {
        log(message: string) {
          return null;
        },
      });

      return config;
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    pageLoadTimeout: 10000,
    defaultCommandTimeout: 5000,
  },
  env: {
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  video: false,
  screenshotOnRunFailure: true,
});
