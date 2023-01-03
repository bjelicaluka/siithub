const Sequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);

    const issueTests = copyTests.filter((test) => test.path.includes("issue\\issue"));
    const otherTests = copyTests.filter((test) => !test.path.includes("issue\\issue")).sort(() => Math.random() - 0.5);

    const chunkSize = Math.floor(otherTests.length / issueTests.length);
    const chunks = makeChunks(otherTests, chunkSize);

    if (issueTests.length > 1 && otherTests.length >= 3) {
      return chunks.flatMap((chunk, i) => [issueTests[i], ...chunk]);
    }

    return copyTests;
  }
}

function makeChunks(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    chunks.push(chunk);
  }

  return chunks;
}

module.exports = CustomSequencer;
