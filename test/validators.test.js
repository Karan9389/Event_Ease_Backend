const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createOrderSchema,
  createServiceSchema,
  registerSchema,
} = require("../src/lib/validators");

const futureDate = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

test("booking validation accepts future calendar dates and strips client-supplied items", () => {
  const { error, value } = createOrderSchema.validate(
    {
      eventName: "Reception",
      eventDate: futureDate(),
      items: [{ id: "untrusted", price: 0.01 }],
    },
    { stripUnknown: true }
  );

  assert.ifError(error);
  assert.equal(value.eventName, "Reception");
  assert.equal("items" in value, false);
});

test("booking validation rejects impossible and past dates", () => {
  assert.ok(createOrderSchema.validate({ eventDate: "2027-02-30" }).error);
  assert.ok(createOrderSchema.validate({ eventDate: "2000-01-01" }).error);
});

test("registration validation trims and normalizes email addresses", () => {
  const { error, value } = registerSchema.validate({
    name: " Event Host ",
    email: "HOST@EXAMPLE.COM ",
    password: "secret1",
  });

  assert.ifError(error);
  assert.equal(value.name, "Event Host");
  assert.equal(value.email, "host@example.com");
});

test("service validation normalizes categories and rejects unsupported categories", () => {
  const service = {
    name: "A vendor",
    category: "MUSIC",
    description: "Live music for events",
    price: 0,
  };
  const valid = createServiceSchema.validate(service);

  assert.ifError(valid.error);
  assert.equal(valid.value.category, "music");
  assert.ok(createServiceSchema.validate({ ...service, category: "florist" }).error);
});
