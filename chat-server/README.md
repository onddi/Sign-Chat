## Sign language chat
#### Node + Socket.io + React

* Socket.io based live-feed chat rooms (no persistance of messages currently)
* A python based server will be connected with socket to feed in Sign language messages made with Leap Motion

### Install + Build
Install [yarn](https://yarnpkg.com/lang/en/docs/install/)

Install [nodemon](https://github.com/remy/nodemon) globally
```
npm i nodemon -g
```
Install server and client dependencies
```
yarn
cd client
yarn
```
Run dev server and client at the same time (from root of the project):
```
yarn dev
```

### TODO
* UX design = how does receiving messages work, how does chat rooms work
* UI design
* Should messages be persisted
* Add [Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for text->voice & voice->text
* ...
