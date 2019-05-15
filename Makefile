install:
	npm install

start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js,.pug' --exec npx gulp server
	# DEBUG="application:*" npx nodemon --exec "npx babel-node -- index.js"

pack:
	npm run webpack

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build
	

test:
	npm test

test-coverage:
	npm -- --test-coverage
