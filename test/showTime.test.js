/** @jest-environment jsdom */

const  { showTime } = require("../admin/js/dashboard")

describe("showTime function", () => {
  test("should correctly update the time and date", () => {

    // Mocks a date and time since there always changing
      const mockDate = new Date("2025-03-20T15:45:00"); 
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      document.body.innerHTML = `
          <div class="time-box"></div>
          <div class="date-box"></div>
      `;

      showTime();

      // Get the updated content
      const timeBox = document.querySelector(".time-box");
      const dateBox = document.querySelector(".date-box");

      // Assert the expected time and date output
      expect(timeBox.textContent).toBe("3:45 PM");
      expect(dateBox.textContent).toBe("Thursday, March 20, 2025");


      jest.restoreAllMocks();
  });
});