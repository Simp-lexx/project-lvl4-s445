install:
	npm install

start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js,.pug' --exec npx gulp -- server
	# DEBUG="application:*" npx nodemon --exec "npx babel-node -- index.js"

pack:
	npm run webpack --display-error-details

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build

dev:
	rm -rf dist
	npm run dev

test:
	npm test

test-coverage:
	npm test -- --coverage

hlogs:
	heroku logs --tail

init:
	npm run gulp init

console:
	npm run gulp console

.PHONY: test
