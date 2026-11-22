import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:true,forbidOnly:Boolean(process.env.CI),retries:0,workers:process.env.CI?2:undefined,
 timeout:60000,expect:{timeout:10000},reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'web-chromium',use:{...devices['Desktop Chrome']}},{name:'android-layout',use:{...devices['Pixel 5']}}],
 webServer:{command:'npm run start -- --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100',reuseExistingServer:!process.env.CI,timeout:60000},
});
