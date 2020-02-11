describe("User can see activities", () => {
  beforeEach(() => {
    cy.server();
    cy.visit("/trip");
  });

  it("successfully", () => {
    cy.chooseActivityType();
    cy.route({
      method: "GET",
      url: "http://localhost:3000/api/v1/activity_types**",
      response: "fixture:3_activities_displayed.json",
      status: 200
    });

    cy.get('#activities-button').click()

  })

});