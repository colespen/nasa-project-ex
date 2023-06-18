const {
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const allLaunches = await getAllLaunches(skip, limit);
  return res.status(200).json(allLaunches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res
      .status(400)
      .json({ error: "missing required launch properties" });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "date invalid" });
  }
  await addNewLaunch(launch);
  console.log("launch added:", launch);
  res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId(launchId);

  if (!existsLaunch) {
    return res.status(404).json({ error: "flight number not found" });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({ error: "launch not aborted" });
  }
  res.status(200).json({ ok: true });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
