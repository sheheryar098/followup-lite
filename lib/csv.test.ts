import { describe, expect, it } from "vitest";
import { contactsFromCsv, contactsToCsv, parseCsv, serializeCsv } from "./csv";

describe("CSV parser", () => {
  it("handles quoted commas and escaped quotes", () => {
    const rows = parseCsv(
      'name,notes\n"Chen, Maya","Said ""let\'s talk"" next week"\n',
    );
    expect(rows[1]).toEqual(["Chen, Maya", 'Said "let\'s talk" next week']);
  });

  it("round-trips commas and newlines", () => {
    const csv = serializeCsv([
      ["name", "notes"],
      ["Priya", "Scope, budget\nand timing"],
    ]);
    expect(parseCsv(csv)[1]).toEqual(["Priya", "Scope, budget\nand timing"]);
  });
});

describe("contact CSV import/export", () => {
  it("maps headers, labels, and dates", () => {
    const csv = [
      "name,company,email,url,channel,status,tags,notes,nextFollowUpAt,lastTouchedAt",
      "Maya Chen,Lattice,maya@lattice.example,https://lattice.example,LinkedIn,Contacted,\"warm, saas\",Intro from Jordan,2026-11-06,2026-11-01",
    ].join("\n");

    const result = contactsFromCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0]).toMatchObject({
      name: "Maya Chen",
      company: "Lattice",
      channel: "LINKEDIN",
      status: "CONTACTED",
      tags: "warm, saas",
    });
    expect(result.contacts[0].nextFollowUpAt).toEqual(new Date(2026, 10, 6));
  });

  it("collects row errors without dropping valid rows", () => {
    const csv = [
      "name,channel,status",
      "Valid Person,Email,New",
      ",Email,New",
      "Bad Channel,Carrier pigeon,New",
    ].join("\n");
    const result = contactsFromCsv(csv);
    expect(result.contacts.map((row) => row.name)).toEqual(["Valid Person"]);
    expect(result.errors.map((error) => error.row)).toEqual([3, 4]);
  });

  it("exports a file that can be imported again", () => {
    const csv = contactsToCsv([
      {
        name: "Owen Blake",
        company: "Northwind Labs",
        email: "owen@northwind.example",
        url: null,
        channel: "EMAIL",
        status: "CONTACTED",
        tags: "inbound",
        notes: "Call next week",
        nextFollowUpAt: new Date(2026, 10, 6),
        lastTouchedAt: null,
      },
    ]);
    const result = contactsFromCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.contacts[0].name).toBe("Owen Blake");
    expect(result.contacts[0].channel).toBe("EMAIL");
    expect(result.contacts[0].nextFollowUpAt).toEqual(new Date(2026, 10, 6));
  });
});
