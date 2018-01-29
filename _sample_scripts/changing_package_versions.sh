# adding a ^ to all essential-projects-versions that don't have it
meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@essential-projects\\/([^\\\"]+)\\\":\\s+\\\"([^\\\^][^\\\"]+)\\\"#\"\\\"\\@essential-projects\\/\" . \$1 . \"\\\": \\\"^\" . \$2 . \"\\\"\"#ge' **/package.json package.json"

# adding a ^ to all process-engine-versions that don't have it
meta exec --exclude documentation,skeleton,process_engine_meta "perl -pi -e 's#\\\"\\@process-engine\\/([^\\\"]+)\\\":\\s+\\\"([^\\\^][^\\\"]+)\\\"#\"\\\"\\@process-engine\\/\" . \$1 . \"\\\": \\\"^\" . \$2 . \"\\\"\"#ge' **/package.json package.json"
