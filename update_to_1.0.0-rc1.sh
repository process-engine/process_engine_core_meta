# clean everything
meta exec "git reset --hard && git clean --force"

# update ALL essential-projects and process-engine dependencies to 1.0.0-rc0
# non-meta-version:
# perl -pi -e 's#\"\@essential-projects\/([^\"]+)\":\s+\"[^\"]+\"#"\"\@essential-projects\/" . $1 . "\": \"1.0.0-rc1\""#ge' **/package.json package.json
meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@essential-projects\\/([^\\\"]+)\\\":\\s+\\\"[^\\\"]+\\\"#\"\\\"\\@essential-projects\\/\" . \$1 . \"\\\": \\\"1.0.0-rc1\\\"\"#ge' **/package.json package.json"

meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@process-engine\\/([^\\\"]+)\\\":\\s+\\\"[^\\\"]+\\\"#\"\\\"\\@process-engine\\/\" . \$1 . \"\\\": \\\"1.0.0-rc1\\\"\"#ge' **/package.json package.json"

meta exec --exclude documentation,skeleton,process_engine_meta "git add -A && git commit -m ':arrow_up: update dependency-versions to 1.0.0-rc1'"

# Bump all package versions to 1.0.0-rc1 (this also creates git tags)
meta exec --exclude documentation,skeleton,process_engine_meta "npm version 1.0.0-rc1"

# make sure master exists
meta exec --exclude documentation,skeleton,process_engine_meta "git checkout master && git pull origin"

# merge develop into master
meta exec --exclude documentation,skeleton,process_engine_meta "git merge develop"

# push everything
meta exec --exclude documentation,skeleton,process_engine_meta "git push --tags && git push"

# publish the package. this also builds everything before it gets published
meta exec --exclude documentation,skeleton,charon,process_engine_meta "npm publish --tag rc1"

# merge develop back into master
meta exec --exclude documentation,skeleton,process_engine_meta "git checkout develop && git merge master && git push"

# don't forget to do all this for the bpmn-io-custom-bundle-package!
