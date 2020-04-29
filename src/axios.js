/* eslint-disable no-underscore-dangle */
// // ./__mocks__/axios.js

let mockDelay = 1;
const axiosMock = jest.genMockFromModule('axios');

let responseCollection = {
  byUrl: {
  },
  bySequence: [],
  defaultResponse: undefined,
};
let errorCollection = JSON.parse(JSON.stringify(responseCollection));
const initialResponseCollection = JSON.parse(JSON.stringify(responseCollection));
const initialErrorCollection = JSON.parse(JSON.stringify(errorCollection));

function clear() {
  responseCollection = initialResponseCollection;
  errorCollection = initialErrorCollection;
}
// success responders
function setMockResponse(inputResponse) {
  responseCollection.defaultResponse = JSON.parse(JSON.stringify(inputResponse));
}
function setMockResponseForUrl(url, mResponse) {
  responseCollection.byUrl[url] = mResponse;
}
function setMockResponseBySequence(mSequencedResponseList) {
  if (Array.isArray(mSequencedResponseList)) {
    responseCollection.bySequence = mSequencedResponseList;
  } else {
    console.error('setMockResponseBySequence expects an Array');
  }
}
// error responders
function setMockError(inputResponse) {
  errorCollection.defaultResponse = JSON.parse(JSON.stringify(inputResponse));
}
function setMockErrorForUrl(url, mResponse) {
  errorCollection.byUrl[url] = mResponse;
}
function setMockErrorBySequence(mSequencedResponseList) {
  if (Array.isArray(mSequencedResponseList)) {
    errorCollection.bySequence = mSequencedResponseList;
  } else {
    console.error('setMockErrorBySequence expects an Array');
  }
}

function responseDecider(url, data, config) {
  return new Promise(((resolve, reject) => {
    setTimeout(() => {
      if (errorCollection.bySequence.length) {
        reject(errorCollection.bySequence.shift());
      } else if (errorCollection.byUrl[url]) {
        reject(errorCollection.byUrl[url]);
      } else if (errorCollection.defaultResponse !== undefined) {
        reject(errorCollection.defaultResponse);
      } else if (responseCollection.bySequence.length) {
        resolve(responseCollection.bySequence.shift());
      } else if (responseCollection.byUrl[url]) {
        resolve(responseCollection.byUrl[url]);
      } else if (responseCollection.defaultResponse !== undefined) {
        resolve(responseCollection.defaultResponse);
      } else {
        console.warn('No Mock Response Available, returning empty response');
        resolve({});
      }
    }, mockDelay);
  }));
}

function createInstance() {
  return axiosMock;
}

axiosMock.get.mockImplementation(responseDecider);
axiosMock.post.mockImplementation(responseDecider);
axiosMock.put.mockImplementation(responseDecider);
axiosMock.delete.mockImplementation(responseDecider);
axiosMock.create.mockImplementation(createInstance);
axiosMock.setMockResponse = setMockResponse;
axiosMock.setMockResponseForUrl = setMockResponseForUrl;
axiosMock.setMockResponseBySequence = setMockResponseBySequence;
axiosMock.setMockError = setMockError;
axiosMock.setMockErrorForUrl = setMockErrorForUrl;
axiosMock.setMockErrorBySequence = setMockErrorBySequence;
axiosMock.clear = clear;

axiosMock.setDelay = (mD) => { mockDelay = mD; };
axiosMock.finishRequest = () => { jest.runOnlyPendingTimers(); };

module.exports = axiosMock;
