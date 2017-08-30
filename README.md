Find the versions of a package in a local git repository.


## Usage
Clone this repo in your machine, do the "npm install" and run:

**node index.js {PATH TO REPO} {PACKAGE NAME}**

Example: **node index.js ../myAppRepo async** (Look the versions of the "async" package in "myAppRepo")


## Output
The script generates a JSON file in the output folder. The JSON has this properties:
- **package**: (string) the package name
- **repoPath**: (string) the path to repo
- **createdAt**: (string) creation date
- **versions**: (array) with all versions used of the package in the repo
- **tagsByVersion**: (object) all the tags used by each version
- **versionsByTag**: (array) all the versions by each tag
- **parents**: (array) info about the parent packages that uses the package


## How it works
Basically, it does:
- cd {PATH TO REPO}
- git tags
- For each tag: git checkout {tag}
- Get all versions of all packages
- Returns the versions of the selected package


## TODOs
- Now, it finds versions by tag. Add commit and branch support


