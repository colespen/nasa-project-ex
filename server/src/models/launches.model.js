const axios = require("axios");

const Launch = require("./launches.mongo");
const Planet = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter) {
  return await Launch.findOne(filter);
}

// separate lookup with delete for launches controller
async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  const latestLaunch = await Launch.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await Launch.find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// fetch from SpaceX API
async function populateLaunches() {
  const launchResponse = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // page: 1,
      // limit: 25,
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (launchResponse.status !== 200) {
    consoe.log("Error downloading launch data");
    throw new Error("Launch SpaceX data downlaod failed");
  }

  const launchDocs = launchResponse.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };
    console.log(launch.flightNumber, launch.mission);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded.");
  } else {
    console.log("downloading launch data");
    await populateLaunches();
  }
}

async function saveLaunch(launch) {
  try {
    await Launch.findOneAndUpdate(
      { flightNumber: launch.flightNumber },
      launch,
      { upsert: true }
    );
  } catch (error) {
    console.error(`Could not save launch: ${error}`);
  }
}

async function addNewLaunch(launch) {
  try {
    const findPlanet = await Planet.findOne({
      keplerName: launch.target,
    });
    if (!findPlanet) {
      throw new Error("No matching planet found");
    }
    const newFlightNumber = (await getLatestFlightNumber()) + 1;
    const newLaunch = Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ["SLC", "NASA"],
      flightNumber: newFlightNumber,
    });
    await saveLaunch(newLaunch);
  } catch (error) {
    console.error(`Could not add launch: ${error}`);
  }
}

async function abortLaunchById(launchId) {
  try {
    const aborted = await Launch.updateOne(
      { flightNumber: launchId },
      { upcoming: false, success: false }
    );
    return aborted.acknowledged === true && aborted.modifiedCount === 1;
  } catch (error) {
    console.error(`Could not delete launch: ${error}`);
  }
}

module.exports = {
  getAllLaunches,
  loadLaunchData,
  addNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
};
