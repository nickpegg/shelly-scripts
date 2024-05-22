// Dead Man's Switch - turn off the output after a certain amount of time
//
// I wrote this because I had a Shelly in a place with spotty WiFi coverage
// where sometimes the output would turn on, Shelly would drop off of WiFi, and
// then HomeAssistant couldn't ever turn it off, which would just roast us.

let CONFIG = {
  // Turn the switch off after this many seconds. If HomeAssistant thinks the
  // house is still too cold, it will turn it back on.
  timeout_s: 15 * 60,
  dry_run: true,
};
let TIMER = null;

Shelly.addEventHandler(function (event) {
  if (event.name === "switch") {
    if (event.info.state) {
      print("Switch ", event.id, " is on");

      // Clear the timer to start over. An attempt at a "keep-alive" but it
      // doesn't seem that HomeAssistant will send another "on" if it thinks
      // the switch is already on
      if (TIMER != null) {
        Timer.clear(TIMER);
        print("Cleared timer");
      }

      TIMER = Timer.set(
        CONFIG.timeout_s * 1000,
        false,
        function () {
          if (CONFIG.dry_run) {
            print("Would turn off switch");
          } else {
            Shelly.call("switch.set", {
              id: event.id,
              on: false,
            });
          }
        },
      );
    } else {
      print("Switch ", event.id, " is off");
      if (TIMER != null) {
        Timer.clear(TIMER);
        print("Cleared timer");
      }
    }
  }
});
