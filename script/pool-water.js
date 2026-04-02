AFRAME.registerComponent("pool-water", {
  schema: {
    speed: { type: "number", default: 1.1 },
    amplitude: { type: "number", default: 0.06 },
    frequency: { type: "number", default: 2.2 }
  },

  init: function () {
    this.offset = 0;
    this.position = null;
    this.base = null;
    this.material = null;

    this.captureGeometry = this.captureGeometry.bind(this);
    this.el.addEventListener("object3dset", this.captureGeometry);
    this.captureGeometry();
  },

  captureGeometry: function () {
    var mesh = this.el.getObject3D("mesh");
    if (!mesh || !mesh.geometry || !mesh.geometry.attributes || !mesh.geometry.attributes.position) {
      return;
    }

    this.position = mesh.geometry.attributes.position;
    this.base = this.position.array.slice();
    this.material = mesh.material || null;
  },

  tick: function (_time, delta) {
    if (!this.position || !this.base) {
      return;
    }

    this.offset += (delta / 1000) * this.data.speed;

    var pos = this.position.array;
    var base = this.base;
    var amplitude = this.data.amplitude;
    var frequency = this.data.frequency;
    var offset = this.offset;

    for (var i = 0; i < pos.length; i += 3) {
      var x = base[i];
      var y = base[i + 1];
      var z = base[i + 2];
      var wave = Math.sin((x + offset) * frequency) + Math.cos((z + offset) * frequency * 0.85);
      var driftX = Math.sin((z + offset) * frequency * 0.35) * amplitude * 0.08;
      var driftZ = Math.cos((x + offset) * frequency * 0.35) * amplitude * 0.08;
      pos[i] = x + driftX;
      pos[i + 1] = y + wave * amplitude;
      pos[i + 2] = z + driftZ;
    }

    this.position.needsUpdate = true;

    if (this.material) {
      this.material.opacity = 0.8 + Math.sin(offset * 2.1) * 0.05;
    }
  },

  remove: function () {
    this.el.removeEventListener("object3dset", this.captureGeometry);
  }
});
