MAKEFLAGS := --silent --always-make
PAR := $(MAKE) -j 128
DIR_TARGET := target
DIR_STATIC := static
DIR_IMG := img
SASS := sass --no-source-map -I . css/main.scss:$(DIR_TARGET)/css/main.css
EXISTING = $(if $(wildcard $(1)),$(1),)
IMPORTMAP := $(or $(call EXISTING,importmap_override.json),importmap.json)
DENO_RUN := deno run -A --no-check --importmap=$(IMPORTMAP)
DENO_WAT := $(DENO_RUN) --watch

# Example usage: `make build verb=true`.
export VERBOSE := $(verb)

ifeq ($(PROD),true)
	SASS := $(SASS) --style=compressed
else
	SASS := $(SASS) --style=expanded
endif

ifeq ($(OS),Windows_NT)
	RM = if exist "$(1)" rmdir /s /q "$(1)"
else
	RM = rm -rf "$(1)"
endif

ifeq ($(OS),Windows_NT)
	MKDIR = if not exist "$(1)" mkdir "$(1)"
else
	MKDIR = mkdir -p "$(1)"
endif

ifeq ($(OS),Windows_NT)
	CP_INNER = if exist "$(1)" copy "$(1)"\* "$(2)" >nul
else
	CP_INNER = if [ -d "$(1)" ]; then cp -r "$(1)"/* "$(2)" ; fi
endif

ifeq ($(OS),Windows_NT)
	CP = if exist "$(1)" copy "$(1)" "$(2)" >nul
else
	CP = if [ -d "$(1)" ]; then cp -r "$(1)" "$(2)" ; fi
endif

ifeq ($(verb),true)
	OK = echo [$@] ok
endif

watch: clean
	$(PAR) css_w srv_w live

build: clean all

all:
	$(PAR) css html cp
	$(OK)

css_w:
	$(SASS) --watch

css:
	$(SASS)
	$(OK)

live:
	$(DENO_RUN) js/cmd_live.mjs

srv_w:
	$(DENO_WAT) js/cmd_srv.mjs

srv:
	$(DENO_RUN) js/cmd_srv.mjs

html_w:
	$(DENO_WAT) js/cmd_html.mjs

html:
	$(DENO_RUN) js/cmd_html.mjs
	$(OK)

deno:
	$(DENO_RUN) $(file)

cp:
	$(call MKDIR,$(DIR_TARGET))
	$(call CP_INNER,$(DIR_STATIC),$(DIR_TARGET))
	$(call CP,$(DIR_IMG),$(DIR_TARGET)/$(DIR_IMG))

clean:
	$(call RM,$(DIR_TARGET))

deps:
ifeq ($(OS),Windows_NT)
	scoop install sass watchexec deno
else
	brew install -q sass/sass/sass watchexec deno
endif

# Updates submodules. If you ran `make hooks`, you shouldn't need to run this
# manually. Otherwise, run this:
#
# * Immediately after cloning this repo.
#
# * When you see "changes" in some of the submodule folders after pulling.
#   This indicates a version update.
#
# This repo should have been configured with the following command:
#
#   git config submodule.recurse true
mod:
# 	git reset mod
	git submodule update --init --recursive --quiet

define HOOK_MOD_UPDATE
#!/bin/sh
git submodule update --init --recursive --quiet
endef
export HOOK_MOD_UPDATE

# Should be run once, after cloning the repo.
hooks:
ifneq ($(OS),Windows_NT)
	echo "$${HOOK_MOD_UPDATE}" > .git/hooks/post-merge
	chmod +x .git/hooks/post-merge
	echo "$${HOOK_MOD_UPDATE}" > .git/hooks/post-checkout
	chmod +x .git/hooks/post-checkout
endif

init: mod hooks
