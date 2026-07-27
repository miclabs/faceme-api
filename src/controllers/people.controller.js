// src/controllers/people.controller.js

const peopleService = require("../services/people.service");

const DEFAULT_GROUP_ID = 1;

exports.importPerson = async (req, res) => {
  try {
    const result = await peopleService.importPerson({
      name: req.body.name,
      employeeId: req.body.employee_id,
      note: req.body.note,
      groupId: req.body.group_id || DEFAULT_GROUP_ID,
      coverImage: req.files?.cover_image?.[0] || null,
      snapshots: req.files?.snapshots || [],
      deviceId: req.body.device_id,
      authorization: req.headers.authorization
    });

    return res.json({
      status: true,
      result
    });
  } catch (error) {
    let errorBody;

    try {
      errorBody = JSON.parse(error.message);
    } catch (_) {
      errorBody = {
        message: error.message
      };
    }

    return res.status(422).json({
      status: false,
      error: errorBody
    });
  }
};

exports.listPeople = async (req, res, next) => {
  try {
    const result = await peopleService.listPeople({
      authorization: req.headers.authorization,
      deviceId: req.query.device_id,
      page: Number(req.query.page || 1),
      perPage: Number(req.query.per_page || 20),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};