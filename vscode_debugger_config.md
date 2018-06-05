# VSCode Debugger Configuration

This meta repository is shipped with several configurations for the visual studio code debugger. 

## Usage of the VS Code Debugger

### Open VSCode in the right directory
To use the Debugger build in VSCode, you have to open visual studio code inside the `process-engine-meta` directory. This can conveniently done with the command line Interface by navigation to your `process-engine-meta` repository and executing `code .`.

### Start a debugging session
To start a Debugging session, you need to follow the following steps:
1. Navigate to the debugger tab on the left side.
2. Select the configuration that matches your currently edited file.
3. Click on the start button.

After starting, the debugger instantly breaks at the first line of executed code. This will give you a chance to set additional breakpoints if needed. 

If you're all set up, click the play button again. The debugger will continue until it reaches a breakpoint or the end of execution.

## Debugging Dependencies
Its possible to set breakpoints in the scripts of the current module dependencies. This *only* works, if you set the Breakpoints in the imported Script, when opening the typescript file over the `node_modules` folder and *not directly from the meta repo*. 

### Example
You are editing something in the `_integration-tests` directory. Now you want to set breakpoints in the `node_instance.ts` file of the `process-engine` module. To do this, open the file that you want to debug via the `node-module` directory of `_integration-tests`. The resulting path, that you have to follow in order to debug the `node_instance.ts` script, should now look like this: 
```
process-engine-meta/_integration_tests/node-modules/@process-engine/src/node_instance.ts
```

Another way would be to simply open the scripts where you want to set break points over the modules pane in the debugger view.

### Cause
This caused by the way, how node and vscode handles symlinks. By default, node does not preserves symlinks which means, that before node executes a script, it resolves the symlinks into *real absolute paths*. The vscode debugger on the other hand just follows the symlinks. In order to run the debugger, we have to force node to preserve the symlinks. With this behavior, it is not possible to directly debug files from the meta repo because they never get loaded by node js. 


