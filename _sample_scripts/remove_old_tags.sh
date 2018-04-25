# For process_engine_meta
ruby remove_old_tags.rb
# For all other repos, assuming this is run from the process_engine_meta folder
meta exec "ruby ../_sample_scripts/remove_old_tags.rb" --exclude process_engine_meta
