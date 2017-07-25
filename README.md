# Process Engine Meta Project

## 1 Setup Meta

```
npm install -g meta
```

* This will install meta globally and enable you to use meta commands

```
npm install
```

* This will install the NPM dependencies of the meta project
  * These dependencies can also include meta plugins

## 2 Repository Management

### 2.1 Clone modules of the meta project

```
meta git update
```

* This will clone all modules into the folder of the meta project

### 2.2 Add an existing module to the meta project

```
meta project add PROJECT_NAME PROJECT_GITHUB_PATH
```

* This will create an entry in the `.meta`-file located in the root directory of the meta project.
* `PROJECT_NAME` should be the name used in the package.json
* `PROJECT_GITHUB_PATH` should be the ssh link copied to clone the repository

### 2.3 Execute a command in **all** repositories

```
meta exec "any command"
```

* If the command contains spaces, make sure to wrap it in quotes

### 2.4 Execute a command in **some** repositories

```
meta exec "any command" --exclude core,core_contracts
meta exec "any command" --include-only core,core_contracts
```

* Arguments for `--exclude` and `--include-only` are separated by commas
* A command run with `--exclude` will be executed in every module specified in the `.meta`-file, excluding the given arguments 
* A command run with `--include-only` will only be executed in modules contained in the argument list - modules specified in the `.meta`-file will not be included

## 3 Project Workflow

### 3.1 Clean all repositories

```
meta git clean -fd
```

* removes **all** untracked changes
* e.g.: to remove all `node_modules` folders

### 3.2 Update all repositories

```
meta exec "git checkout develop"
meta exec "git pull"
```

* First checkout the `develop` branch so that every repository is on the same branch
  * If you got unsaved work on any repository that is not on the `develop` branch you will see an error that you have to manually fix
* Then pull the `develop` branch to fetch possible updates
  * If you got unsaved work on a repository that already was on the `develop` branch you will see an error that you have to manually fix

### 3.3 Install NPM dependencies

Although the meta NPM plugin provides a shortcut to install the `node_modules` for every package this involves a lot of overhead, because it starts fresh in every package and executes `npm install` in it.

A better way to achieve this is by sharing the same node_modules in multiple packages wherever it is possible.

We can do this by using the tool `minstall`:

* To run minstall just execute `npm install` in the root folder of the meta project
  * The package folders should already exist at this time (see `3.1`)


This is the meta way: 

```
meta npm install
```

* BE CAREFUL: this can take a long time
* Runs npm install in each module specified in the `.meta`-file individually

### 3.4 Local Setup (linking local modules)

```
meta npm link --all
```

* Links all modules specified in the `.meta`-file if they are a dependency to another module specified in the `.meta`-file

### 3.5 Initialize git flow on all repositories

```
meta exec "git checkout master" // wenn git flow init auf master ausgeführt wird können alle Default-Branchnamen via Enter selektiert werden
meta exec "git flow init"
```

* First checkout the `master` branch so that every repository is on the same branch
  * This will enable you to use the git flow default branch names and just hit `Enter` during initilization
* Then `git flow init` will be run in each repository individually

### 3.6 Start a feature on multiple repositories

```
meta exec "git flow feature start my_feature" --include-only core,core_contracts
```

* Starts the feature "my_feature" in the modules `core` and `core_contracts`

### 3.7 Publish a feature on multiple repositories

```
meta exec "git flow feature publish my_feature" --include-only core,core_contracts
```

* Publishes the feature "my_feature" in the modules `core` and `core_contracts`

### 3.8 List the git status on all repositories

```
meta git status
```

* Runs `git status` in each module specified in the `.meta`-file individually

### 3.9 Push the changed on all repositories

```
meta git push
```

* Runs `git push` in each module specified in the `.meta`-file individually