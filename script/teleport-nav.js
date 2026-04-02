(function () {
  var ROOM_TARGETS = {
    living: { name: "Living Room", pos: { x: 31.5, y: 1.5, z: -18.0 } },
    kitchen: { name: "Kitchen", pos: { x: 40.8, y: 1.5, z: -19.5 } },
    bedroom1: { name: "Bedroom 1", pos: { x: 31.2, y: 5, z: -20.0 } },
    neon: { name: "Bedroom 2 ", pos: { x: 40.0, y: 5, z: -24.0 } },
    outside: { name: "Outside ", pos: { x: 40.0, y: 1.5, z: 20.0 } }
  };

  AFRAME.registerComponent("adaptive-renderer", {
    init: function () {
      var isMobile = AFRAME.utils.device.isMobile();
      this.el.setAttribute("renderer", {
        colorManagement: true,
        physicallyCorrectLights: true,
        antialias: !isMobile,
        precision: "mediump",
        powerPreference: "high-performance"
      });
    }
  });

  AFRAME.registerComponent("villa-teleport-nav", {
    schema: {
      rig: { type: "selector" },
      roomHud: { type: "selector" },
      navPanel: { type: "selector" },
      navToggle: { type: "selector" },
      effect: { type: "selector" }
    },

    init: function () {
      this.onClick = this.onClick.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.togglePanel = this.togglePanel.bind(this);

      this.rig = this.data.rig;
      this.roomHud = this.data.roomHud;
      this.menuButtons = Array.prototype.slice.call(document.querySelectorAll(".map-point, .floor-chip"));
      this.navPanel = this.data.navPanel;
      this.navToggle = this.data.navToggle;
      this.effect = this.data.effect;

      this.menuButtons.forEach(function (btn) {
        btn.addEventListener("click", this.onClick);
      }, this);

      if (this.navToggle) this.navToggle.addEventListener("click", this.togglePanel);
      window.addEventListener("keydown", this.onKeyDown);

      this.activateRoom("outside");
    },

    setRoomLabel: function (roomName) {
      if (!this.roomHud) return;
      this.roomHud.textContent = "Current Room: " + roomName;
    },

    onClick: function (evt) {
      var roomKey = evt.currentTarget.getAttribute("data-room");
      this.activateRoom(roomKey);
    },

    onKeyDown: function (evt) {
      if (!evt) return;
      if (evt.key === "m" || evt.key === "M") {
        this.togglePanel();
        return;
      }

      var keyMap = {
        "1": "living",
        "2": "kitchen",
        "3": "bedroom1",
        "4": "neon",
        "5": "outside"
      };

      var roomKey = keyMap[evt.key];
      if (roomKey) this.activateRoom(roomKey);
    },

    togglePanel: function () {
      if (!this.navPanel || !this.navToggle) return;
      var hidden = this.navPanel.classList.toggle("is-hidden");
      this.navToggle.textContent = hidden ? "Show" : "Hide";
    },

    flashTeleportFx: function () {
      return;
    },

    activateRoom: function (roomKey) {
      var target = ROOM_TARGETS[roomKey];
      if (!target || !this.rig) return;

      var wasd = this.rig.components["wasd-controls"];
      if (wasd && wasd.velocity) {
        wasd.velocity.set(0, 0, 0);
      }

      var cameraEl = this.rig.querySelector("a-camera");
      if (cameraEl) {
        cameraEl.setAttribute("position", "0 0 0");
      }

      this.rig.removeAttribute("animation__teleport");
      this.rig.setAttribute("position", target.pos.x + " " + target.pos.y + " " + target.pos.z);

      this.menuButtons.forEach(function (btn) {
        var isActive = btn.getAttribute("data-room") === roomKey;
        btn.classList.toggle("active", isActive);
      });

      this.setRoomLabel(target.name);
      this.flashTeleportFx();
    },

    remove: function () {
      this.menuButtons.forEach(function (btn) {
        btn.removeEventListener("click", this.onClick);
      }, this);

      if (this.navToggle) this.navToggle.removeEventListener("click", this.togglePanel);
      window.removeEventListener("keydown", this.onKeyDown);
    }
  });
})();
