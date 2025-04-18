// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

import { config } from "config";

export const environment = {
  production: false,
  apiURL: 'http://localhost/feria_api/public/api',
  googleClientId: '1034218239938-5r5hcirur74dkrjgjbkoof8mvgauj0u6.apps.googleusercontent.com',
  googleClientSecret: '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'
};
