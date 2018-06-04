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

If you're all set up, click the play button again. The debugger will continiue until it reaches a breakpoint or the end of execution.


