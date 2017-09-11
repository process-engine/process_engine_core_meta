# dirstribute template-files to the correct repositories

**tslint.json**

```bash
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton,process_engine_meta exec "cp -f ../templates/tslint.json ."
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton,process_engine_meta exec "git add tslint.json && git commit -m ':package: update tslint' && git push"
```

**.gitignore**

```bash
meta --exclude demo,documentation,skeleton,process_engine_meta exec "cp -f ../templates/.gitignore ."
meta --exclude demo,documentation,skeleton,process_engine_meta exec "git add .gitignore && git commit -m ':package: update gitignore' && git push"
```

**.npmignore**

```bash
meta --exclude demo,documentation,skeleton,process_engine_meta exec "cp -f ../templates/.npmignore ."
meta --exclude demo,documentation,skeleton,process_engine_meta exec "git add .npmignore && git commit -m ':package: update npmignore' && git push"
```
