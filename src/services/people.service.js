// src/services/people.service.js

const FormData = require("form-data");
const FaceMeService = require("./faceme.service");
const { savePerson, getPeople, removePerson } = require("./personStore");
const authService = require("./auth.service");
const ImageService = require('./image.service')

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
      await savePerson(deviceId, personId);
    }

    return response;
  }

  async listPeople({
    authorization,
    deviceId,
    page = 1,
    perPage = 20
  }) {
    const people = await getPeople(deviceId);

    const start = (page - 1) * perPage;
    const pagedPeople = people.slice(start, start + perPage);

    await authService.loadConfig(deviceId, authorization);
    const baseUrl = authService.getBaseUrl();

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

          let coverImageUrl = null;

          if (response.coverImageUrl) {
            coverImageUrl = await ImageService.cacheImage(
              `${baseUrl}${response.coverImageUrl}`,
              response.personId,
              deviceId
            );
          }

          return {
            id: response.personId,
            name: response.name,
            coverImageUrl: coverImageUrl,
            visitedCount: response.visitedCount
          };
        } catch (error) {
          console.error(`Failed to load person ${person}:`, error.message);
          return null;
        }
      })
    );

    const filteredData = data.filter(item => item !== null)

    return {
      page,
      perPage,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / perPage),
      data: filteredData
    };
  }

  async updatePerson({
    personId,
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

    form.append("personId", personId);
    form.append("name", name || "");
    form.append("employeeId", employeeId || "");
    form.append("groupId", groupId || 2);
    form.append("note", note || "");

    if (coverImage) {
      form.append("coverImage", coverImage.buffer, {
        filename: coverImage.originalname,
        contentType: coverImage.mimetype
      });
    }

    snapshots.forEach(snapshot => {
      form.append("snapshot", snapshot.buffer, {
        filename: snapshot.originalname,
        contentType: snapshot.mimetype
      });
    });

    let result = FaceMeService.postMultipart(
      "/api/website/person/update",
      form,
      {
        authorization,
        deviceId
      }
    );

    return result;
  }

  async deletePerson({
    personId,
    authorization,
    deviceId
  }) {
    try {
      const response = await FaceMeService.postForm(
        "/api/website/person/delete",
        {
          personId
        },
        {
          authorization,
          deviceId
        }
      );

      await removePerson(deviceId, Number(personId));

      return response;
    } catch (error) {
      console.error(
        `Failed to delete person ${personId}:`,
        error.message
      );

      return JSON.parse(error.message)
    }
  }
}

module.exports = new PeopleService();