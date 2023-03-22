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

# Execute this command:
#
# * Immediately after cloning this repo.
#
# * When you see "changes" in some of the submodule folders after pulling.
#   This indicates a version update.
mod:
	git reset mod
	git submodule update --init --recursive --quiet

deps:
ifeq ($(OS),Windows_NT)
	scoop install sass watchexec deno
else
	brew install -q sass/sass/sass watchexec deno
endif
	$(MAKE) mod
