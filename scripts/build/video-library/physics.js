const v = (id, title, spec, channel) => ({ id, title, tag: `${spec} · ${channel}` });
const PO = 'Physics Online';
const ZP = 'ZPhysics';
const DAVE = 'Understanding A Level Physics by Dave';

module.exports = {
  slug: 'physics',
  name: 'Physics',
  level: 'A Level',
  intro: 'AQA A-level Physics explanations, grouped by topic. Videos play here in Forge.',
  heading: 'AQA 7408 · Physics Online, ZPhysics and others',
  groups: [
    { title: 'Measurements, particles and quantum phenomena', videos: [
      v('pwp1NcfXu80', 'Measurements and their errors', '3.1', PO),
      v('bMuqbjHfnPk', 'Particle physics', '3.2', ZP),
      v('ORhXRlhrbG0', 'Baryons and mesons in terms of quarks', '3.2', PO),
      v('6VqNz4oT0ng', 'The photoelectric effect', '3.2', PO),
      v('DzK0MjMfb-w', 'Electron energy levels', '3.2', PO),
      v('ZqspDsQSZuI', 'The de Broglie wavelength and wave–particle duality', '3.2', PO),
    ] },
    { title: 'Waves', videos: [
      v('DuomJ2B1rao', 'Introduction to waves', '3.3', PO),
      v('GsP5LqGtkwE', 'Stationary waves on a string', '3.3', PO),
      v('flPSbngdLwI', 'Diffraction gratings', '3.3', PO),
      v('k8oK67nlm3M', 'Refraction and Snell’s law', '3.3', PO),
      v('5py3JxDZaZM', 'Total internal reflection and the critical angle', '3.3', PO),
    ] },
    { title: 'Mechanics and materials', videos: [
      v('ZzDYfGFODGY', 'The SUVAT equations of motion', '3.4', PO),
      v('9thdmEdCcKw', 'Projectile motion', '3.4', PO),
      v('7x6SpYdkjC4', 'The principle of moments', '3.4', PO),
      v('ICN5Pn3syq0', 'Work, energy and power', '3.4', ZP),
      v('XefR-1rwcu4', 'Conservation of momentum', '3.4', PO),
      v('trPCwp_RHJM', 'Impulse', '3.4', PO),
      v('EC2dNWGSHCc', 'Stress, strain and the Young modulus', '3.4', PO),
    ] },
    { title: 'Electricity', videos: [
      v('C1PmobeDzAM', 'AQA electricity overview', '3.5', PO),
      v('YwMvOT6xee0', 'Resistivity', '3.5', PO),
      v('Zc8sUNMAVpU', 'Potential divider circuits', '3.5', PO),
      v('9r3Xgd79MFw', 'EMF and internal resistance', '3.5', 'Science Shorts'),
    ] },
    { title: 'Further mechanics and thermal physics', videos: [
      v('9n4xhxYtARg', 'Circular motion', '3.6.1', ZP),
      v('OFz6xHUbNeU', 'Simple harmonic motion', '3.6.1', DAVE),
      v('nXj3VS0iM-c', 'Thermal physics', '3.6.2', 'Science Shorts'),
    ] },
    { title: 'Fields and their consequences', videos: [
      v('aGgYTvC16hA', 'Gravitational fields', '3.7', ZP),
      v('7QKA3h04nNM', 'Electric fields', '3.7', ZP),
      v('wCtS2SPg8Ik', 'Capacitors', '3.7', ZP),
      v('kkv6R990fkM', 'Magnetic fields', '3.7', DAVE),
    ] },
    { title: 'Nuclear physics and astrophysics', videos: [
      v('Lj9a7dSQ9n0', 'Radioactive decay', '3.8', DAVE),
      v('4Ws2A6hsrI0', 'Astrophysics (option)', '3.9', ZP),
    ] },
  ],
};
