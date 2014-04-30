ANGULARVSN ?= 1.2.14
CRYPTOJSVSN ?= 3.1.2
JQUERYVSN ?= 1.11.0
JQUERYUIVSN ?= 1.8.15
BOOTSTRAPVSN ?= 3.1.1

all: vendor/ace-builds-master vendor/angular-$(ANGULARVSN) \
	vendor/crypto-js-$(CRYPTOJSVSN) vendor/bootstrap-$(BOOTSTRAPVSN) \
	vendor/jquery-$(JQUERYVSN).js vendor/jquery-ui-$(JQUERYUIVSN).js vendor/tagsinput \
	vendor/angular-spinner.js vendor/spin.js

vendor/ace-builds-master:
	mkdir -p vendor
	(cd vendor; \
		curl -Lo ace-builds-master.zip https://codeload.github.com/ajaxorg/ace-builds/zip/master; \
		unzip ace-builds-master.zip)

vendor/angular-$(ANGULARVSN):
	mkdir -p vendor
	(cd vendor; \
		curl -LO http://code.angularjs.org/$(ANGULARVSN)/angular-$(ANGULARVSN).zip; \
		unzip angular-$(ANGULARVSN))


vendor/crypto-js-$(CRYPTOJSVSN):
	mkdir -p vendor
	(cd vendor; \
		curl -Lo crypto-js-$(CRYPTOJSVSN).zip https://crypto-js.googlecode.com/files/CryptoJS%20v$(CRYPTOJSVSN).zip; \
		unzip -d crypto-js-$(CRYPTOJSVSN) "crypto-js-$(CRYPTOJSVSN).zip")

vendor/bootstrap-$(BOOTSTRAPVSN):
	mkdir -p vendor
	(cd vendor; \
		curl -Lo bootstrap-$(BOOTSTRAPVSN).zip https://github.com/twbs/bootstrap/archive/v$(BOOTSTRAPVSN).zip; \
		unzip bootstrap-$(BOOTSTRAPVSN).zip)

vendor/jquery-$(JQUERYVSN).js:
	mkdir -p vendor
	(cd vendor; curl -LO http://code.jquery.com/jquery-1.11.0.js)

vendor/jquery-ui-$(JQUERYUIVSN).js:
	mkdir -p vendor
	(cd vendor; curl -o jquery-ui-$(JQUERYUIVSN).js https://ajax.googleapis.com/ajax/libs/jqueryui/$(JQUERYUIVSN)/jquery-ui.js)

vendor/tagsinput:
	mkdir -p vendor
	(cd vendor; curl -LO https://github.com/TimSchlechter/bootstrap-tagsinput/raw/master/build/bootstrap-tagsinput.zip; \
		unzip -d tagsinput bootstrap-tagsinput.zip)

vendor/angular-spinner.js:
	mkdir -p vendor
	(cd vendor; curl -LO https://raw.githubusercontent.com/urish/angular-spinner/master/angular-spinner.js )

vendor/spin.js:
	mkdir -p vendor
	(cd vendor; curl -LO http://fgnass.github.io/spin.js/spin.js)

#curl -O https://raw.github.com/bassjobsen/Bootstrap-3-Typeahead/master/bootstrap3-typeahead.js
#curl -O https://raw.github.com/edudar/bootstrap-multiselect/master/js/bootstrap-multiselect.js
