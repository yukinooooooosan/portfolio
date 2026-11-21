// Each face-UV cell stores retained liquid in the same units as a moving bead.
const SIDE = 96;
const CAPACITY = 0.0032;
const clampCell = index => Math.max(0, Math.min(SIDE - 1, index));

export class WetFilm {
  constructor(textureSize) {
    this.mass = new Float32Array(SIDE * SIDE);
    this.textureSize = textureSize;
    this.layer = new Float32Array(textureSize * textureSize);
    this.changed = false;
  }

  clear() {
    this.mass.fill(0);
    this.layer.fill(0);
    this.changed = false;
  }

  saturation(u, v) {
    const x = clampCell(Math.round(u * (SIDE - 1)));
    const y = clampCell(Math.round(v * (SIDE - 1)));
    return Math.min(1, this.mass[y * SIDE + x] / CAPACITY);
  }

  // A full patch accepts less of the offered volume. The remainder stays at the tip.
  deposit(u, v, radius, offered) {
    if (offered <= 0) return 0;
    const cx = u * (SIDE - 1), cy = v * (SIDE - 1);
    const reach = Math.max(1.25, radius * (SIDE - 1));
    const minX = clampCell(Math.ceil(cx - reach)), maxX = clampCell(Math.floor(cx + reach));
    const minY = clampCell(Math.ceil(cy - reach)), maxY = clampCell(Math.floor(cy + reach));
    const invArea = 1 / (reach * reach);
    // The discrete weights are normalized so no stamp can take more than offered.
    let weights = 0, retained = 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        weights += Math.max(0, 1 - ((x - cx) ** 2 + (y - cy) ** 2) * invArea);
      }
    }
    if (!weights) return 0;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const weight = Math.max(0, 1 - ((x - cx) ** 2 + (y - cy) ** 2) * invArea);
        const index = y * SIDE + x;
        const room = Math.max(0, CAPACITY - this.mass[index]);
        const take = Math.min(room, offered * weight / weights * (room / CAPACITY));
        this.mass[index] += take;
        retained += take;
      }
    }
    if (retained > 0) this.changed = true;
    return retained;
  }

  leaveTrack(u0, v0, u1, v1, radius, volume) {
    const distance = Math.hypot(u1 - u0, v1 - v0);
    if (distance < 1e-8) return 0;
    const count = Math.max(1, Math.ceil(distance * SIDE));
    const offered = Math.min(volume, distance * (1.45 + radius * 20)) / count;
    let retained = 0;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      retained += this.deposit(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t, radius * 0.60, offered);
    }
    return retained;
  }

  copyHeight(target) {
    if (this.changed) {
      const size = this.textureSize;
      for (let y = 0; y < size; y++) {
        const fy = y * (SIDE - 1) / (size - 1), row = Math.floor(fy), ty = fy - row;
        const top = row * SIDE, bottom = Math.min(row + 1, SIDE - 1) * SIDE;
        for (let x = 0; x < size; x++) {
          const fx = x * (SIDE - 1) / (size - 1), col = Math.floor(fx), tx = fx - col;
          const next = Math.min(col + 1, SIDE - 1);
          const a = this.mass[top + col] * (1 - tx) + this.mass[top + next] * tx;
          const b = this.mass[bottom + col] * (1 - tx) + this.mass[bottom + next] * tx;
          this.layer[y * size + x] = (a * (1 - ty) + b * ty) * (0.50 / CAPACITY);
        }
      }
      this.changed = false;
    }
    target.set(this.layer);
  }
}
