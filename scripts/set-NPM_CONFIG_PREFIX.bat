rem yarn has issues with amphtml-validator on windows bypassed with this (https://github.com/yarnpkg/yarn/issues/4918#issuecomment-355712632)
for /f "delims=" %%A in ('node -e console.log^(process.execPath^)') do @set "NPM_CONFIG_PREFIX=%%A"
