# Process Engine Meta Project

## Introduction
This project is the meta Repository for the whole process engine Project. 

This guide describes the process for installing and setting up a complete
developer setup.

## Setup and Installation

There are currently two shell scripts that help you to set up the
meta repository and keep it up to date.

### setup.sh

This script performs a complete setup, including downloading the repositories,
installing all dependencies, running the build process and setting/resetting
the local database.

### reinstall.sh

This is a light-weight alternative to the setup-script. 
It performs only the installation and the build process and is therefore better
suited for testing your changes.

## About the Meta Repository

A meta repository combines both advantages of a monolithic and a distributed
repository structure by creating a _meta repository_. 

The meta repository contains a clone of all component repos that are used by
the process engine. 

Logically, it looks like the whole project is a monolithic repo, but internally
every component is a git repository itself. 

So you keep every used component in one place, but also can work independently
on every component. 

## General Workflow

### Creating a feature branch

To demonstrate the workflow, we use an example where we create a new feature
branch for an integration test.

1. Create a feature branch using `git flow feature start imaginary_element_test`
2. Commit your changes as usual
3. Publish your feature branch using `git flow feature publish 
imaginary_element_test`

Now we want to create a new feature for the `process-engine` module. 
1. Navigate into the `process-engine` directory
2. Create a feature branch using `git flow feature start imaginary_feature`
3. Commit your changes as usual
4. Publish your feature branch using `git flow feature publish imaginary_feature`

### Package.json

todo

## About the used tools

This section covers the used tools a bit more in depth.

### Meta

#### Setup Meta

```
npm install -g meta
```

* This will install meta globally and enable you to use meta commands

```
npm install
```

* This will install the NPM dependencies of the meta project
  * These dependencies can also include meta plugins

### Repository Management

#### Clone modules of the meta project

```
meta git update
```

* This will clone all modules into the folder of the meta project

#### Add an existing module to the meta project

```
meta project add PROJECT_NAME PROJECT_GITHUB_PATH
```

* This will create an entry in the `.meta`-file located in the root directory
of the meta project.
* `PROJECT_NAME` should be the name used in the package.json
* `PROJECT_GITHUB_PATH` should be the ssh link copied to clone the repository

#### Execute a command in **all** repositories

```
meta exec "any command"
```

* If the command contains spaces, make sure to wrap it in quotes

#### Execute a command in **some** repositories

```
meta exec "any command" --exclude core,core_contracts
meta exec "any command" --include-only core,core_contracts
```

* Arguments for `--exclude` and `--include-only` are separated by commas
* A command run with `--exclude` will be executed in every module specified in
the `.meta`-file, excluding the given arguments 
* A command run with `--include-only` will only be executed in modules 
contained in the argument list - modules specified in the `.meta`-file will not
be included

### Project Workflow

#### Clean all repositories

```
meta git clean -fd
```

* removes **all** untracked changes
* e.g.: to remove all `node_modules` folders

#### Update all repositories

```
meta exec "git checkout develop"
meta exec "git pull"
```

* First checkout the `develop` branch so that every repository is on the
same branch
  * If you got unsaved work on any repository that is not on the `develop`
  branch you will see an error that you have to manually fix
* Then pull the `develop` branch to fetch possible updates
  * If you got unsaved work on a repository that already was on the `develop`
  branch you will see an error that you have to manually fix

#### Install NPM dependencies

Although the meta NPM plugin provides a shortcut to install the `node_modules`
for every package this involves a lot of overhead, because it starts fresh in
every package and executes `npm install` in it.

A better way to achieve this is by sharing the same node_modules in multiple
packages wherever it is possible.

We can do this by using the tool `Minstall`:

* To run `Minstall` just execute `npm install` in the root folder of the meta
project
  * The package folders should already exist at this time (see `3.1`)


This is the meta way: 

```
meta npm install
```

* BE CAREFUL: this can take a long time
* Runs npm install in each module specified in the `.meta`-file individually

#### Local Setup (linking local modules)

```
meta npm link --all
```

* Links all modules specified in the `.meta`-file if they are a dependency to
another module specified in the `.meta`-file

#### Initialize git flow on all repositories

```
meta exec "git checkout master"
meta exec "git flow init"
```

* First checkout the `master` branch so that every repository is on the same
branch
  * This will enable you to use the git flow default branch names and just hit
  `Enter` during initilization
* Then `git flow init` will be run in each repository individually

#### Start a feature on multiple repositories

```
meta exec "git flow feature start my_feature" --include-only core,core_contracts
```

* Starts the feature "my_feature" in the modules `core` and `core_contracts`

#### Publish a feature on multiple repositories

```
meta exec "git flow feature publish my_feature" --include-only core,core_contracts
```

* Publishes the feature "my_feature" in the modules `core` and `core_contracts`

#### List the git status on all repositories

```
meta git status
```

* Runs `git status` in each module specified in the `.meta`-file individually

#### Push the changed on all repositories

```
meta git push
```

* Runs `git push` in each module specified in the `.meta`-file individually

### VSCode Debugger Configurations

todo
