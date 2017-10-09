**update some packages (uses https://www.npmjs.com/package/npm-check-updates)**
```bash
meta exec "ncu --filter typescript,tslint,tsconfig,loggerhythm,sprintf-js,es6-promise,ajv,@types/node,eslint,eslint-config-5minds,bpmn-moddle,gulptraum --peer --upgrade --upgradeAll && ncu --filter typescript,tslint,tsconfig,loggerhythm,sprintf-js,es6-promise,ajv,@types/node,eslint,eslint-config-5minds,bpmn-moddle,gulptraum --upgrade --upgradeAll"
```

**commit the package.json**
```bash
meta exec "git add package.json && git commit -m ':arrow_up: update dependency versions' && git push"
```

**update @essential-projects/gulptraum to gulptraum**
```bash
meta exec "sed -i '' \"s/@process-engine-js\/gulptraum/gulptraum/g\" package.json"
meta exec "git add package.json && git commit -m ':arrow_up: update to gulptraum' && git push"
```

**remove node_modules and add it to the gitignore**
```bash
meta exec "rm -rf node_modules && git add -A && git commit -m ':fire: remove node_modules-folder' && git push && echo '\nnode_modules\n' >> .gitignore && git add -A && git commit -m ':package: add node_modules to gitignore' && git push"
```

**remove schemas and doc and update the gitignore**
```bash
meta --exclude demo,documentation,skeleton,process_engine_meta exec "rm -rf doc && rm -rf schemas && git add -A && git commit -m ':fire: remove doc-folder and schemas-folder'"
meta --exclude demo,documentation,skeleton,process_engine_meta exec "cp -f ../templates/.gitignore ."
meta --exclude demo,documentation,skeleton,process_engine_meta exec "git add .gitignore && git commit -m ':package: update gitignore' && git push"
```

**install/update tslint**
```bash
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton exec "npm install --save-dev @essential-projects/tslint-config typescript tslint"
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton exec "echo \"{\\n  \\\"extends\\\": \\\"@essential-projects/tslint-config\\\"\\n}\" > tslint.json"
meta exec "ncu --filter typescript,tslint,tsconfig --upgrade --upgradeAll"
meta exec "npm uninstall --save --save-dev tslint-config-5minds"
meta exec "git add package.json tslint.json && git commit -m ':art: update/install tsconfig' && git push"
```

**update addict-ioc**
```bash
meta exec "ncu --filter addict-ioc --upgrade --upgradeAll && ncu --filter addict-ioc --peer --upgrade --upgradeAll"
meta exec "git add package.json && git commit -m ':arrow_up: update addict-ioc' && git push"
```

**update all first-party package versions**
```bash
meta exec "sed -i '' 's#\"@essential-projects/bootstrapper_node\": \"[^\"]*\"#\"@essential-projects/bootstrapper_node\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/bootstrapper\": \"[^\"]*\"#\"@essential-projects/bootstrapper\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/core_contracts\": \"[^\"]*\"#\"@essential-projects/core_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/core\": \"[^\"]*\"#\"@essential-projects/core\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/data_model_contracts\": \"[^\"]*\"#\"@essential-projects/data_model_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/data_model\": \"[^\"]*\"#\"@essential-projects/data_model\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_base\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_base\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_localstorage\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_localstorage\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_mongodb\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_mongodb\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_orientdb\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_orientdb\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_postgres\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_postgres\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_proxy\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_proxy\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datasource_adapter_redis\": \"[^\"]*\"#\"@essential-projects/datasource_adapter_redis\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datastore_contracts\": \"[^\"]*\"#\"@essential-projects/datastore_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datastore_http\": \"[^\"]*\"#\"@essential-projects/datastore_http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datastore_messagebus_contracts\": \"[^\"]*\"#\"@essential-projects/datastore_messagebus_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datastore_messagebus\": \"[^\"]*\"#\"@essential-projects/datastore_messagebus\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/datastore\": \"[^\"]*\"#\"@essential-projects/datastore\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/demo_frontend\": \"[^\"]*\"#\"@process-engine/demo_frontend\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/demo\": \"[^\"]*\"#\"@process-engine/demo\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/event_aggregator_contracts\": \"[^\"]*\"#\"@essential-projects/event_aggregator_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/event_aggregator\": \"[^\"]*\"#\"@essential-projects/event_aggregator\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/feature_contracts\": \"[^\"]*\"#\"@essential-projects/feature_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/feature\": \"[^\"]*\"#\"@essential-projects/feature\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/frontend_contracts\": \"[^\"]*\"#\"@process-engine/frontend_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/frontend_http\": \"[^\"]*\"#\"@process-engine/frontend_http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/frontend_mui\": \"[^\"]*\"#\"@process-engine/frontend_mui\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/frontend_react_plugin_process_manager\": \"[^\"]*\"#\"@process-engine/frontend_react_plugin_process_manager\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/frontend\": \"[^\"]*\"#\"@process-engine/frontend\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/graphql_contracts\": \"[^\"]*\"#\"@process-engine/graphql_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/graphql_http\": \"[^\"]*\"#\"@process-engine/graphql_http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/graphql\": \"[^\"]*\"#\"@process-engine/graphql\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/http_contracts\": \"[^\"]*\"#\"@essential-projects/http_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/http_extension\": \"[^\"]*\"#\"@essential-projects/http_extension\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/http_node\": \"[^\"]*\"#\"@essential-projects/http_node\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/http\": \"[^\"]*\"#\"@essential-projects/http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/iam_browser\": \"[^\"]*\"#\"@essential-projects/iam_browser\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/iam_contracts\": \"[^\"]*\"#\"@essential-projects/iam_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/iam_http\": \"[^\"]*\"#\"@essential-projects/iam_http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/iam\": \"[^\"]*\"#\"@essential-projects/iam\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/invocation_contracts\": \"[^\"]*\"#\"@essential-projects/invocation_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/invocation\": \"[^\"]*\"#\"@essential-projects/invocation\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus_adapter_faye_browser\": \"[^\"]*\"#\"@essential-projects/messagebus_adapter_faye_browser\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus_adapter_faye\": \"[^\"]*\"#\"@essential-projects/messagebus_adapter_faye\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus_adapter_local\": \"[^\"]*\"#\"@essential-projects/messagebus_adapter_local\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus_contracts\": \"[^\"]*\"#\"@essential-projects/messagebus_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus_http\": \"[^\"]*\"#\"@essential-projects/messagebus_http\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/messagebus\": \"[^\"]*\"#\"@essential-projects/messagebus\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/metadata_contracts\": \"[^\"]*\"#\"@essential-projects/metadata_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/metadata\": \"[^\"]*\"#\"@essential-projects/metadata\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/pki_service_contracts\": \"[^\"]*\"#\"@essential-projects/pki_service_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/pki_service\": \"[^\"]*\"#\"@essential-projects/pki_service\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_engine_client_api\": \"[^\"]*\"#\"@process-engine/process_engine_client_api\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_engine_client_processable_react\": \"[^\"]*\"#\"@process-engine/process_engine_client_processable_react\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_engine_contracts\": \"[^\"]*\"#\"@process-engine/process_engine_contracts\": \"^3.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_engine_http\": \"[^\"]*\"#\"@process-engine/process_engine_http\": \"^3.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_engine\": \"[^\"]*\"#\"@process-engine/process_engine\": \"^3.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_repository_browser\": \"[^\"]*\"#\"@process-engine/process_repository_browser\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@process-engine/process_repository\": \"[^\"]*\"#\"@process-engine/process_repository\": \"^3.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/routing_contracts\": \"[^\"]*\"#\"@essential-projects/routing_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/routing\": \"[^\"]*\"#\"@essential-projects/routing\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/security_service_contracts\": \"[^\"]*\"#\"@essential-projects/security_service_contracts\": \"^1.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/security_service\": \"[^\"]*\"#\"@essential-projects/security_service\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/services_contracts\": \"[^\"]*\"#\"@essential-projects/services_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/services\": \"[^\"]*\"#\"@essential-projects/services\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/timing_contracts\": \"[^\"]*\"#\"@essential-projects/timing_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/timing\": \"[^\"]*\"#\"@essential-projects/timing\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/validation_contracts\": \"[^\"]*\"#\"@essential-projects/validation_contracts\": \"^2.0.0\"#g' package.json"
meta exec "sed -i '' 's#\"@essential-projects/validation\": \"[^\"]*\"#\"@essential-projects/validation\": \"^2.0.0\"#g' package.json"
```

**update all package-versions to the next major**
```bash
meta exec "perl -pi -e 's/\\s+\"version\":\\s+\"(\\d+).\\d+.\\d+\"(.+)/\"  \\\"version\\\": \\\"\" . (\$1+1) . \".0.0\\\"\" . \$2/ge' package.json"
# non-meta version:
# perl -p -e 's/\s+"version":\s+"(\d+).\d+.\d+"(.+)/"  \"version\": \"" . ($1+1) . ".0.0\"" . $2/ge' package.json
```

**add build and prepublishOnly scripts (uses https://www.npmjs.com/package/npm-add-script)**
```bash
meta --exclude demo,documentation,skeleton exec "npmAddScript --key build --value 'gulp build' --force && npmAddScript --key prepublishOnly --value 'npm run build' --force"
```

**update tslint-config**
```bash
meta exec "ncu --filter @essential-projects/tslint-config --upgrade --upgradeAll && ncu --filter @essential-projects/tslint-config --peer --upgrade --upgradeAll"
```

**autofix tslint-errors**
```bash
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton exec "tslint --fix 'src/**/*.ts?(x)'"
meta exec "git add src/* && git commit -m ':art: fix autifixables' && git push"
```

**add schema and doc tasks**
```bash
meta --exclude demo,documentation,frontend_react_plugin_process_manager,skeleton,process_engine_meta exec "npmAddScript --key build-doc --value 'gulp doc' --force && npmAddScript --key build-schemas --value 'gulp typescript-schema' --force"
```
