// src/services/people.service.js

const FormData = require("form-data");
const FaceMeService = require("./faceme.service");
const { savePerson } = require("./personStore");

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
}

module.exports = new PeopleService();