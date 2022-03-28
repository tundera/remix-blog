describe("smoke tests", () => {
  afterEach(() => {});

  it("should allow you view posts", () => {
    cy.visit("/");
    cy.findByRole("link", { name: /blog posts/i }).click();

    cy.findByRole("link", { name: /a mixtape i made just for you/i }).click();

    cy.findByText("I wish (Skee-Lo)");
    cy.findByText("This Is How We Do It (Montell Jordan)");
    cy.findByText("Everlong (Foo Fighters)");
    cy.findByText("Ms. Jackson (Outkast)");
  });
});
