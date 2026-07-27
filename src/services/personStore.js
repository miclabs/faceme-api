const fs = require("fs/promises");
const path = require("path");

const PEOPLE_FILE = path.join(__dirname, "..", "store", "people.json");

async function savePerson(personId) {
  let people = [];

  console.log('====')
  console.log(personId)

  try {
    const data = await fs.readFile(PEOPLE_FILE, "utf8");
    people = JSON.parse(data);
  } catch (err) {
    // File doesn't exist or is invalid; start with an empty array
    people = [];
  }

  // Avoid duplicates
  const existing = people.find(
    p => p === personId
  );

  if (!existing) {
    people.push(personId);

    await fs.writeFile(
      PEOPLE_FILE,
      JSON.stringify(people, null, 2)
    );
  }

  return personId;
}

module.exports = {
  savePerson,
};