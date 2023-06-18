const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo.js");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  }, 30000);

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "Kepler-62 f",
      target: "a blackhole,",
      launchDate: "January 19, 2099",
    };
    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "Kepler-62 f",
      target: "a blackhole,",
    };

    test("It should respond with 201 created and match properties except date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(response.body).toMatchObject(launchDataWithoutDate);
      expect(responseDate).toBe(requestDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "missing required launch properties",
      });
    });

    test("It should catch invalid dates", async () => {
      launchDataWithoutDate.launchDate = "some invalid date input";
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({ error: "date invalid" });
    });
  });
});
