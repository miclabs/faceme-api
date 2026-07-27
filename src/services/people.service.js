// src/services/people.service.js

const FormData = require("form-data");
const FaceMeService = require("./faceme.service");
const { savePerson, getPeople } = require("./personStore");
const authService = require("./auth.service");

class PeopleService {
  async importPerson({
    name,
    employeeId,
    note,
    groupId,
    coverImage,
    snapshots,
    authorization,
    deviceId
  }) {
    const form = new FormData();

    form.append("name", name);
    form.append("employeeId", employeeId || "");
    form.append("groupId", 2);
    form.append("note", note || "");

    // Match the working curl request
    form.append("forceImport", "false");
    form.append("skipQC", "false");
    form.append("accessPeriod", "");
    form.append("information", "");

    if (coverImage) {
      form.append(
        "coverImage",
        coverImage.buffer,
        {
          filename: coverImage.originalname,
          contentType: coverImage.mimetype
        }
      );
    } else {
      form.append("coverImage", "");
    }

    snapshots.forEach((snapshot) => {
      form.append(
        "snapshot",
        snapshot.buffer,
        {
          filename: snapshot.originalname,
          contentType: snapshot.mimetype
        }
      );
    });

    const response = await FaceMeService.postMultipart(
      "/api/website/person/import",
      form,
      {
        authorization,
        deviceId,
      }
    );

    if (response.operation == 'CREATE') {
      const personId = response.personId;

      // Save personId to JSON or database
      await savePerson(personId);
    }

    return response;
  }

  async listPeople({
    authorization,
    deviceId,
    page = 1,
    perPage = 20
  }) {

    const people = await getPeople();

    const start = (page - 1) * perPage;
    const pagedPeople = people.slice(start, start + perPage);

    const baseUrl = authService.getBaseUrl(authorization, deviceId);

    const data = await Promise.all(
      pagedPeople.map(async (person) => {
        try {
          const response = await FaceMeService.postForm(
            "/api/website/person/query",
            {
              personId: person
            },
            {
              authorization,
              deviceId
            }
          );

          return {
            name: response.name,
            coverImageUrl: `${baseUrl}${response.coverImageUrl}`,
            visitedCount: response.visitedCount
          };
        } catch (error) {
          return {
            personId: person.personId,
            error: error.message
          };
        }
      })
    );

    return {
      page,
      perPage,
      total: people.length,
      totalPages: Math.ceil(people.length / perPage),
      data
    };
  }
}

module.exports = new PeopleService();