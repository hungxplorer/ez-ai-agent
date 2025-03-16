const { Knex } = require("knex");

exports.up = async function (knex) {
  return knex.schema.createTable("agents", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table
      .enum("llmType", ["Gemini", "ChatGPT", "Deepseek", "Grok"])
      .notNullable();
    table.string("apiKey").notNullable();
    table.string("apiPath").notNullable().unique();
    table.text("systemPrompt").notNullable();
    table.jsonb("requestSchema");
    table.jsonb("responseSchema");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  return knex.schema.dropTable("agents");
};
