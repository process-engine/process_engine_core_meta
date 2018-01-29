# adding a ^ to all essential-projects-versions that don't have it
meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@essential-projects\\/([^\\\"]+)\\\":\\s+\\\"([^\\\^][^\\\"]+)\\\"#\"\\\"\\@essential-projects\\/\" . \$1 . \"\\\": \\\"^\" . \$2 . \"\\\"\"#ge' **/package.json package.json"

# adding a ^ to all process-engine-versions that don't have it
meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@process-engine\\/([^\\\"]+)\\\":\\s+\\\"([^\\\^][^\\\"]+)\\\"#\"\\\"\\@process-engine\\/\" . \$1 . \"\\\": \\\"^\" . \$2 . \"\\\"\"#ge' **/package.json package.json"

# raising all rc-versions by 1
meta exec "perl -pi -e 's/\\s+\"version\":\\s+\"(\\d+).\\d+.\\d+-rc(\\d)\"(.+)/\"  \\\"version\\\": \\\"\" . (\$1) . \".0.0-rc\" . (\$2+1) . \"\\\"\" . \$3/ge' package.json"
