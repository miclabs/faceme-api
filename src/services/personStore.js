const fs = require("fs/promises");
const path = require("path");

function getPeopleFile(deviceId) {
  return path.join(
    __dirname,
    "..",
    "store",
    String(deviceId),
    "people.json"
  );
}

async function removePerson(deviceId, personId) {
  const people = await getPeople(deviceId);

  const updated = people.filter(id => id !== Number(personId));

  const peopleFile = getPeopleFile(deviceId);

  await fs.writeFile(
    peopleFile,
    JSON.stringify(updated, null, 2),
    "utf8"
  );
}

async function savePerson(deviceId, personId) {
  const peopleFile = getPeopleFile(deviceId);

  await fs.mkdir(path.dirname(peopleFile), {
    recursive: true
  });

  let people = [];

  try {
    const data = await fs.readFile(peopleFile, "utf8");
    people = data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (!people.includes(personId)) {
    people.push(personId);

    await fs.writeFile(
      peopleFile,
      JSON.stringify(people, null, 2),
      "utf8"
    );
  }

  return personId;
}

async function getPeople(deviceId) {
  const peopleFile = getPeopleFile(deviceId);

  try {
    const data = await fs.readFile(peopleFile, "utf8");
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

module.exports = {
  savePerson,
  getPeople,
  removePerson
};