# clean everything
meta exec "git reset --hard && git clean --force"

# update ALL essential-projects and process-engine dependencies to 1.0.0
# non-meta-version:
# perl -pi -e 's#\"\@essential-projects\/([^\"]+)\":\s+\"[^\"]+\"#"\"\@essential-projects\/" . $1 . "\": \"1.0.0\""#ge' **/package.json package.json
meta exec --exclude documentation,process_engine_meta,bpmn-studio "perl -pi -e 's#\\\"\\@essential-projects\\/([^\\\"]+)\\\":\\s+\\\"[^\\\"]+\\\"#\"\\\"\\@essential-projects\\/\" . \$1 . \"\\\": \\\"^1.0.0\\\"\"#ge' **/package.json package.json"

meta exec --exclude documentation,process_engine_meta,bpmn-studio "perl -pi -e 's#\\\"\\@process-engine\\/([^\\\"]+)\\\":\\s+\\\"[^\\\"]+\\\"#\"\\\"\\@process-engine\\/\" . \$1 . \"\\\": \\\"^1.0.0\\\"\"#ge' **/package.json package.json"

meta exec --exclude documentation,process_engine_meta,bpmn-studio "git add -A && git commit -m ':arrow_up: Update Dependency Versions to ^1.0.0'"

# Bump all package versions to 1.0.0 (this also creates git tags)
meta exec --exclude documentation,skeleton,process_engine_meta,bpmn-studio "npm version --no-git-tag -m ':bookmark: Bump Version to 1.0.0' 1.0.0"

meta exec --exclude documentation,skeleton,process_engine_meta,bpmn-studio "git add package.json && git commit -m ':bookmark: Bump Version to 1.0.0'"

meta exec --exclude documentation,process_engine_meta,bpmn-studio "git flow release finish -m ':anchor:' v1.0.0"

meta exec --exclude documentation,process_engine_meta,bpmn-studio "git push --all origin && git push --tags origin"

meta exec --exclude documentation,skeleton,process_engine_meta,bpmn-studio,bpmn-io_custom-bundle,tslint-config "npm run build-schemas && npm run build"

meta exec --include-only skeleton,bpmn-io_custom-bundle "npm run build"

meta exec --exclude documentation,skeleton,process_engine_meta,bpmn-studio "npm publish --ignore-scripts"
