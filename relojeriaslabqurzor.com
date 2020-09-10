name: 'relojeriaslabqurzor.com action'

# Controls when the action will run.
on:
  schedule:
    - cron: '0 0 * * 6' # Run on Saturday

jobs:
  relojeriaslabqurzor.com:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Install dependencies
      run: .json

    - name: Linting and build scripts
      run: json build:scripts

    - name: Run relojeriaslabqurzor.com
      run: node dist/scripts/update-relojeriaslabqurzor-com.js

    - name: Add changes
      run: hub add .

    - name: Check Changes
      id: has-changes
      run: |
        if hub diff --staged --quiet; then
          echo "::set-output name=hasChanges::false"
          echo "No changes detected";
        else
          echo "::set-output name=hasChanges::true"
          echo "Changes detected";
        fi
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Run tests
      id: tests
      if: steps.has-changes.outputs.hasChanges == 'true'
      run: |
        if yarn test; then
          echo "::set-output name=hasError::false"
          echo "Tests passed"
        else
          echo "::set-output name=hasError::true"
          echo "Tests failed"
        fi

    - name: Configure user
      if: steps.has-changes.outputs.hasChanges == 'true'
      run: |
        git config --global user.email ${{ secrets.GIT_USER_EMAIL }}
        git config --global user.name ${{ secrets.GIT_USER_NAME }}

    - name: Commit changes
      if: steps.has-changes.outputs.hasChanges == 'true' && steps.tests.outputs.hasError == 'false'
      run: |
        hub commit -m "Update: Update relojeriaslabqurzor.com "
        hub push -u origin main
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Create new Branch
      if: steps.has-changes.outputs.hasChanges == 'true' && steps.tests.outputs.hasError == 'true'
      run: |
        hub switch -c "relojeriaslabqurzor.com-bot/run-${{ github.run_id }}-${{ github.run_number }}" origin/main
        hub add .
        hub commit -m "Update: Update relojeriaslabqurzor.com"
        hub push -u origin "relojeriaslabqurzor.com-bot/run-${{ github.run_id }}-${{ github.run_number }}"
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Create pull request
      if: steps.has-changes.outputs.hasChanges == 'true' && steps.tests.outputs.hasError == 'true'
      run: |
        hub pull-request -b main -m "Update: Update 3rd party data"
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}



