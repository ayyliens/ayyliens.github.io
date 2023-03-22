## Dev

Install dependencies. Requires `brew` on MacOS (https://brew.sh) or `scoop` on Windows (https://scoop.sh).

    make deps

Clone submodules and setup Git hooks that automatically update submodules:

    make init

If using Windows, you'll need to run `make mod` whenever Git shows you a "change" in submodules.

Run in watch mode:

    make
